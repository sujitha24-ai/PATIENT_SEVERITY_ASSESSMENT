"""
RESQ-AI backend.

Loads the trained Bio_ClinicalBERT severity-classification checkpoint
(backend/model/model.safetensors) with Hugging Face Transformers + PyTorch,
and a local OpenAI Whisper model, and serves both over:

  POST /transcribe    -> real Whisper speech-to-text
  POST /analyze-text  -> real Bio_ClinicalBERT severity classification
  GET  /health

No synthetic/fake predictions or transcripts: every response comes from a
real model forward pass. Neither model is retrained or modified anywhere
in this file.
"""

import logging
import os
import tempfile
from pathlib import Path

import torch
import whisper
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"
MAX_SEQ_LENGTH = 512

# Whisper model size. "base" is a reasonable CPU-speed/accuracy tradeoff;
# override with WHISPER_MODEL env var (e.g. "small", "tiny") if desired.
WHISPER_MODEL_NAME = os.environ.get("WHISPER_MODEL", "base")

# Never let transformers silently reach out to the Hugging Face Hub at
# request time -- this deployment must only ever use the local checkpoint.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resq-ai-backend")

# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Transcript / free text to classify")


class AnalyzeTextResponse(BaseModel):
    text: str
    severity: str
    confidence: float
    probabilities: dict[str, float]


class TranscribeResponse(BaseModel):
    transcript: str


# --------------------------------------------------------------------------
# Model loading (once, at startup)
# --------------------------------------------------------------------------

app = FastAPI(title="RESQ-AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # local dev; tighten for production deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_tokenizer = None
_model = None
_whisper_model = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_model():
    """Load the real trained checkpoint from backend/model/. Raises if any
    required file is missing rather than silently falling back to anything
    fake or randomly initialized."""
    global _tokenizer, _model

    required_files = [
        "model.safetensors",
        "config.json",
        "vocab.txt",
        "tokenizer_config.json",
    ]
    missing = [f for f in required_files if not (MODEL_DIR / f).exists()]
    if missing:
        raise RuntimeError(
            f"Cannot start: missing required model files in {MODEL_DIR}: {missing}"
        )

    logger.info("Loading tokenizer from %s", MODEL_DIR)
    _tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))

    logger.info("Loading Bio_ClinicalBERT severity classifier weights from %s", MODEL_DIR)
    _model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
    _model.to(_device)
    _model.eval()

    logger.info(
        "Model ready. Labels: %s | device: %s",
        _model.config.id2label,
        _device,
    )


def load_whisper():
    """Load the real local Whisper model once at startup."""
    global _whisper_model
    logger.info("Loading Whisper model '%s' (this can take a while on CPU)...", WHISPER_MODEL_NAME)
    _whisper_model = whisper.load_model(WHISPER_MODEL_NAME, device="cpu")
    logger.info("Whisper model '%s' ready.", WHISPER_MODEL_NAME)


@app.on_event("startup")
def on_startup():
    load_model()
    load_whisper()


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------


@app.get("/health")
def health():
    return {
        "status": "ok" if (_model is not None and _whisper_model is not None) else "loading",
        "device": str(_device),
        "labels": _model.config.id2label if _model is not None else None,
        "whisper_model": WHISPER_MODEL_NAME if _whisper_model is not None else None,
    }


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(file: UploadFile = File(...)):
    if _whisper_model is None:
        raise HTTPException(status_code=503, detail="Whisper model is not loaded")

    suffix = Path(file.filename or "").suffix or ".webm"
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty")

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        try:
            result = _whisper_model.transcribe(tmp.name)
        except Exception as exc:  # decoding/ffmpeg errors, unsupported format, etc.
            logger.exception("Whisper transcription failed")
            raise HTTPException(status_code=422, detail=f"Could not transcribe audio: {exc}") from exc

    transcript = (result.get("text") or "").strip()
    return TranscribeResponse(transcript=transcript)


@app.post("/analyze-text", response_model=AnalyzeTextResponse)
def analyze_text(payload: AnalyzeTextRequest):
    if _model is None or _tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")

    inputs = _tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=MAX_SEQ_LENGTH,
        padding=True,
    ).to(_device)

    with torch.no_grad():
        logits = _model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]

    id2label = _model.config.id2label
    probabilities = {id2label[i]: float(round(probs[i].item(), 6)) for i in range(len(probs))}

    pred_id = int(torch.argmax(probs).item())
    severity = id2label[pred_id]
    confidence = float(round(probs[pred_id].item(), 6))

    return AnalyzeTextResponse(
        text=text,
        severity=severity,
        confidence=confidence,
        probabilities=probabilities,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
