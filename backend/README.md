# RESQ-AI Backend

FastAPI service that loads the trained Bio_ClinicalBERT severity-classification
checkpoint (`model/model.safetensors`) and serves predictions to the existing
React frontend via `POST /analyze-text`.

## ⚠️ Important note on `model/config.json`, `tokenizer_config.json`, `vocab.txt`, `special_tokens_map.json`

The uploaded project only contained `model.safetensors` (the trained weights).
The tokenizer/config files that HuggingFace normally saves alongside a
checkpoint (`config.json`, `tokenizer.json`/`vocab.txt`, `tokenizer_config.json`)
were **not** present anywhere in the project.

With your explicit confirmation that the base model was unmodified
`emilyalsentzer/Bio_ClinicalBERT`, these files were reconstructed as follows:

- `vocab.txt` — the standard, unmodified `bert-base-cased` vocabulary
  (28,996 tokens). Verified to exactly match the checkpoint: the
  `bert.embeddings.word_embeddings.weight` tensor in `model.safetensors` has
  shape `[28996, 768]`, and special-token positions (`[UNK]`=101, `[CLS]`=102,
  `[SEP]`=103, `[MASK]`=104) match. Bio_ClinicalBERT uses this vocabulary
  unchanged.
- `config.json` — standard BERT-base architecture values
  (12 layers, hidden size 768, 12 heads, intermediate size 3072,
  max position 512), all directly **verified against the actual tensor
  shapes** in `model.safetensors` (not guessed).
- `tokenizer_config.json`, `special_tokens_map.json` — standard
  `BertTokenizer` settings matching the vocab above.

**One value could NOT be verified from the weights and is an assumption:**
the `id2label` order in `config.json`:

```json
{"0": "Critical", "1": "High", "2": "Moderate", "3": "Low"}
```

This order was taken from the frontend (`src/lib/severity.ts`
`SEVERITY_LEVELS`) and the README, since that's the only ordering evidence
available in the project. The classifier head only tells us there are 4
output classes (`classifier.weight` shape `[4, 768]`) — it does not encode
which index corresponds to which label. **If your original training script
used a different label encoding (e.g. alphabetical: Critical=0, High=1,
Low=2, Moderate=3, or something else), predictions will be systematically
mislabeled.** Check your training notebook/script for the `LabelEncoder`
classes or `label2id` mapping used at fine-tuning time, and update
`model/config.json`'s `id2label`/`label2id` accordingly if it differs.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app:app --reload --port 8000
```

The server loads the model once at startup (~1-2s on CPU) and logs the
detected label mapping and device. Health check: `GET http://localhost:8000/health`.

## API

`POST /analyze-text`

Request:
```json
{ "text": "My father suddenly collapsed and he is not responding." }
```

Response:
```json
{
  "text": "...",
  "severity": "Critical",
  "confidence": 0.42,
  "probabilities": {
    "Critical": 0.42,
    "High": 0.30,
    "Moderate": 0.18,
    "Low": 0.10
  }
}
```
