
/**
 * Service layer / API abstraction.
 *
 * Functions below call the real FastAPI backend running in Google Colab:
 *   - transcribeAudio -> POST /transcribe
 *   - analyzeText     -> POST /predict (ClinicalBERT Experiment 3)
 *
 * The backend is exposed through a Cloudflare Tunnel.
 */

import type { Severity } from "@/lib/severity";

export const API_BASE_URL =
  import.meta.env["https://circle-ontario-compromise-coral.trycloudflare.com"] ?? "";

export class BackendUnavailableError extends Error {
  constructor(message = "Backend not connected") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

/** Thrown when the backend responds with a non-2xx status. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isBackendConfigured = () =>
  API_BASE_URL.length > 0;

async function extractErrorDetail(
  res: Response
): Promise<string> {
  try {
    const data: unknown = await res.clone().json();

    if (
      data &&
      typeof data === "object" &&
      "detail" in data &&
      typeof (data as { detail?: unknown }).detail === "string"
    ) {
      return (data as { detail: string }).detail;
    }
  } catch {
    // Response wasn't JSON.
  }

  return res.statusText || `HTTP ${res.status}`;
}

async function post<T>(
  path: string,
  body: FormData | object
): Promise<T> {
  if (!isBackendConfigured()) {
    throw new BackendUnavailableError();
  }

  const isForm = body instanceof FormData;

  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      body: isForm ? body : JSON.stringify(body),
      headers: isForm
        ? {}
        : { "Content-Type": "application/json" },
    });
  } catch {
    throw new BackendUnavailableError(
      `Could not reach backend at ${API_BASE_URL}${path}.`
    );
  }

  if (!res.ok) {
    const detail = await extractErrorDetail(res);
    throw new ApiError(res.status, detail);
  }

  return (await res.json()) as T;
}

/**
 * GET /health
 *
 * Checks whether the Colab FastAPI backend is reachable.
 */
export async function checkHealth(): Promise<unknown> {
  if (!isBackendConfigured()) {
    throw new BackendUnavailableError();
  }

  const res = await fetch(`${API_BASE_URL}/health`);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      await extractErrorDetail(res)
    );
  }

  return res.json();
}

/**
 * POST /transcribe
 *
 * Whisper speech-to-text endpoint.
 *
 * NOTE:
 * This endpoint will be connected to the Colab Whisper
 * backend in the next step.
 */
export async function transcribeAudio(
  audio: Blob
): Promise<{ transcript: string }> {
  const form = new FormData();

  form.append("file", audio);

  return post("/transcribe", form);
}

/**
 * POST /predict
 *
 * ClinicalBERT Experiment 3 severity classification.
 *
 * Backend response:
 * {
 *   text,
 *   severity,
 *   confidence,
 *   probabilities
 * }
 */
export async function analyzeText(
  transcript: string
): Promise<{
  severity: Severity;
  confidence: number;
  probabilities: Partial<Record<Severity, number>>;
}> {
  const res = await post<{
    text: string;
    severity: Severity;
    confidence: number;
    probabilities: Partial<Record<Severity, number>>;
  }>("/predict", {
    text: transcript,
  });

  return {
    severity: res.severity,
    confidence: res.confidence,
    probabilities: res.probabilities,
  };
}

export const PIPELINE_STEPS = [
  "Speech-to-Text transcription",
  "Analyzing severity",
] as const;
