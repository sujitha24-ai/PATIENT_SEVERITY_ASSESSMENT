import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeverityResult } from "@/components/SeverityResult";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import {
  analyzeText,
  transcribeAudio,
  ApiError,
  BackendUnavailableError,
  isBackendConfigured,
  PIPELINE_STEPS,
} from "@/services/analysisService";
import type { AnalysisResult } from "@/lib/severity";
import { cn } from "@/lib/utils";
import {
  UploadCloud,
  Mic,
  Square,
  Trash2,
  AlertCircle,
  Loader2,
  Check,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Emergency Call — Upload or Record Audio" },
      {
        name: "description",
        content:
          "Upload or record an emergency call recording and run the planned Speech-to-Text and severity classification pipeline.",
      },
      { property: "og:title", content: "Analyze Emergency Call" },
      {
        property: "og:description",
        content:
          "Dispatcher interface for submitting emergency call audio for AI-assisted severity assessment.",
      },
    ],
  }),
  component: AnalyzePage,
});

const ACCEPTED = [".wav", ".mp3", ".m4a", ".ogg", ".webm", ".aac", ".flac"];

type Phase = "idle" | "processing" | "done" | "error";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState("");

  const source: Blob | null = file ?? recordedBlob;

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const acceptFile = useCallback((f: File) => {
    const ok =
      f.type.startsWith("audio/") ||
      ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!ok) {
      setFileError(
        `Unsupported audio format. Accepted formats: ${ACCEPTED.join(", ")}`,
      );
      return;
    }
    setFileError(null);
    setFile(f);
    setPhase("idle");
    setResult(null);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    const probe = new Audio(url);
    probe.addEventListener("loadedmetadata", () => {
      setDuration(Number.isFinite(probe.duration) ? formatTime(probe.duration) : null);
    });
    probe.addEventListener("error", () => setDuration(null));
  }, []);

  const clearFile = () => {
    setFile(null);
    setDuration(null);
    setAudioUrl(null);
    setFileError(null);
  };

  const startRecording = async () => {
    setRecError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      setRecordedBlob(null);
      setRecordedUrl(null);
      timerRef.current = setInterval(() => setElapsed((v) => v + 1), 1000);
    } catch {
      setRecError(
        "Microphone access was denied or no microphone is available. Check browser permissions.",
      );
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setElapsed(0);
  };

  const describeError = (err: unknown): string => {
    if (err instanceof BackendUnavailableError) {
      return `${err.message} Start the FastAPI server (see backend/README.md) and confirm VITE_ANALYSIS_API_URL is set.`;
    }
    if (err instanceof ApiError) {
      return `Backend error (${err.status}): ${err.message}`;
    }
    if (err instanceof Error) {
      return `Analysis failed: ${err.message}`;
    }
    return "Analysis failed due to an unknown error.";
  };

  const runAnalysis = async () => {
    const manualText = transcript.trim();
    if (!source && !manualText) {
      setMessage(
        "No audio or transcript to analyze. Upload/record audio, or use Edit on the transcript panel to type one.",
      );
      setPhase("error");
      return;
    }

    setPhase("processing");
    setMessage(null);
    setResult(null);
    setStep(source ? 0 : 1);

    try {
      let text = manualText;

      if (source) {
        // Step 1: Audio -> Whisper -> transcript
        const { transcript: whisperTranscript } = await transcribeAudio(source);
        text = whisperTranscript.trim();
        setTranscript(text);
        if (!text) {
          setPhase("error");
          setMessage(
            "Whisper returned an empty transcript for this audio. Try a clearer recording, or type the transcript manually.",
          );
          return;
        }
      }

      // Step 2: Transcript -> Bio_ClinicalBERT -> severity
      setStep(1);
      const res = await analyzeText(text);
      setStep(PIPELINE_STEPS.length);
      setResult({
        transcript: text,
        severity: res.severity,
        confidence: res.confidence,
        symptoms: [],
        probabilities: res.probabilities,
      });
      setPhase("done");
    } catch (err) {
      setPhase("error");
      setMessage(describeError(err));
    }
  };

  return (
    <AppLayout
      title="Analyze Emergency Call"
      subtitle="Provide call audio for transcription and severity assessment"
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Call Audio Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload">
                <TabsList className="w-full">
                  <TabsTrigger value="upload" className="flex-1">
                    Upload Audio
                  </TabsTrigger>
                  <TabsTrigger value="record" className="flex-1">
                    Record Audio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4 space-y-3">
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) acceptFile(f);
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/40 px-6 py-10 text-center transition-colors",
                      dragging && "border-primary bg-accent",
                    )}
                  >
                    <UploadCloud
                      className="h-6 w-6 text-muted-foreground"
                      aria-hidden
                    />
                    <p className="mt-3 text-sm font-medium">
                      Drag and drop an audio file, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Accepted: {ACCEPTED.join(", ")}
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) acceptFile(f);
                      }}
                    />
                  </label>

                  {fileError && <ErrorNote>{fileError}</ErrorNote>}

                  {file && (
                    <div className="rounded-md border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(0)} KB
                            {duration ? ` · ${duration}` : " · duration unavailable"}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearFile}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                      {audioUrl && (
                        <audio controls src={audioUrl} className="mt-3 w-full" />
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="record" className="mt-4 space-y-3">
                  <div className="flex flex-col items-center rounded-md border border-border bg-secondary/40 px-6 py-8">
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      aria-label={recording ? "Stop recording" : "Start recording"}
                      className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full border transition-colors",
                        recording
                          ? "border-sev-critical/40 bg-sev-critical/12 text-sev-critical"
                          : "border-border bg-card text-primary hover:bg-accent",
                      )}
                    >
                      {recording ? (
                        <Square className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </button>
                    <p className="mt-3 font-mono text-xl">{formatTime(elapsed)}</p>
                    <p className="text-xs text-muted-foreground">
                      {recording ? "Recording in progress" : "Press to start recording"}
                    </p>
                  </div>

                  {recError && <ErrorNote>{recError}</ErrorNote>}

                  {recordedUrl && (
                    <div className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Recorded call audio</p>
                        <Button variant="outline" size="sm" onClick={deleteRecording}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                      <audio controls src={recordedUrl} className="mt-3 w-full" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button className="mt-5 w-full" onClick={runAnalysis} disabled={phase === "processing"}>
                {phase === "processing" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Analyze Emergency Call
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Backend status:{" "}
                {isBackendConfigured() ? "endpoint configured" : "not connected"}.
              </p>
            </CardContent>
          </Card>

          {phase !== "idle" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Processing Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-2">
                  {PIPELINE_STEPS.map((label, i) => {
                    const state =
                      phase === "processing" && i === step
                        ? "active"
                        : i < step || phase === "done"
                          ? "done"
                          : phase === "error" && i >= step
                            ? "stopped"
                            : "pending";
                    return (
                      <li key={label} className="flex items-center gap-3 text-sm">
                        {state === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : state === "done" ? (
                          <Check className="h-4 w-4 text-sev-low" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-border" />
                        )}
                        <span
                          className={cn(
                            state === "pending" || state === "stopped"
                              ? "text-muted-foreground"
                              : "text-foreground",
                          )}
                        >
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <p className="flex items-start gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Both stages are live: audio is transcribed by a local
                  Whisper model, then the transcript is scored by the local
                  Bio_ClinicalBERT severity classifier. You can also skip
                  audio entirely — use Edit on the transcript panel to type
                  or paste text directly.
                </p>
                {phase === "error" && message && <ErrorNote>{message}</ErrorNote>}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <TranscriptPanel transcript={transcript} onChange={setTranscript} />
          <SeverityResult
            severity={result?.severity}
            confidence={result?.confidence}
            symptoms={result?.symptoms}
            timestamp={result ? new Date().toLocaleString() : undefined}
            probabilities={result?.probabilities}
            modelStatus={
              result ? "Bio_ClinicalBERT (live)" : "Backend integration pending"
            }
          />
        </div>
      </div>
    </AppLayout>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-md border border-sev-critical/35 bg-sev-critical/8 px-3 py-2 text-xs leading-relaxed text-sev-critical">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
