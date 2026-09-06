import type { CaseRecord } from "@/lib/severity";

/**
 * DEMONSTRATION DATA ONLY.
 * Synthetic records written for interface testing. No real patients,
 * no real calls, no real model output.
 */
export const DEMO_CASES: CaseRecord[] = [
  {
    id: "DEMO-1041",
    date: "2026-08-16",
    time: "21:14",
    severity: "Critical",
    confidence: 0.94,
    symptoms: ["chest pain", "breathing difficulty", "sweating"],
    status: "Reviewed",
    transcript:
      "Sample demonstration transcript. Caller reports severe chest pain radiating to the left arm with difficulty breathing for the last ten minutes.",
    audio: { filename: "demo_call_1041.wav", duration: "01:12", format: "WAV" },
  },
  {
    id: "DEMO-1040",
    date: "2026-08-16",
    time: "19:02",
    severity: "High",
    confidence: 0.88,
    symptoms: ["abdominal pain", "vomiting"],
    status: "Reviewed",
    transcript:
      "Sample demonstration transcript. Caller reports intense abdominal pain with repeated vomiting since the afternoon.",
    audio: { filename: "demo_call_1040.mp3", duration: "00:48", format: "MP3" },
  },
  {
    id: "DEMO-1039",
    date: "2026-08-15",
    time: "16:37",
    severity: "Moderate",
    confidence: 0.76,
    symptoms: ["dizziness", "headache"],
    status: "Pending Review",
    transcript:
      "Sample demonstration transcript. Caller describes recurring dizziness and a persistent headache through the day.",
    audio: { filename: "demo_call_1039.wav", duration: "00:39", format: "WAV" },
  },
  {
    id: "DEMO-1038",
    date: "2026-08-15",
    time: "11:20",
    severity: "Low",
    confidence: 0.81,
    symptoms: ["minor cut"],
    status: "Archived",
    transcript:
      "Sample demonstration transcript. Caller reports a small cut on the hand with minor bleeding already controlled.",
    audio: { filename: "demo_call_1038.m4a", duration: "00:25", format: "M4A" },
  },
  {
    id: "DEMO-1037",
    date: "2026-08-14",
    time: "23:51",
    severity: "Critical",
    confidence: 0.91,
    symptoms: ["unconsciousness", "irregular breathing"],
    status: "Reviewed",
    transcript:
      "Sample demonstration transcript. Caller states a person is unresponsive with irregular breathing patterns.",
    audio: { filename: "demo_call_1037.wav", duration: "01:35", format: "WAV" },
  },
  {
    id: "DEMO-1036",
    date: "2026-08-14",
    time: "09:05",
    severity: "Moderate",
    confidence: 0.72,
    symptoms: ["fever", "weakness"],
    status: "Pending Review",
    transcript:
      "Sample demonstration transcript. Caller reports high fever with general weakness lasting two days.",
    audio: { filename: "demo_call_1036.mp3", duration: "00:57", format: "MP3" },
  },
  {
    id: "DEMO-1035",
    date: "2026-08-13",
    time: "14:42",
    severity: "High",
    confidence: 0.85,
    symptoms: ["fall injury", "leg pain", "swelling"],
    status: "Reviewed",
    transcript:
      "Sample demonstration transcript. Caller describes a fall from height with severe leg pain and visible swelling.",
    audio: { filename: "demo_call_1035.wav", duration: "01:03", format: "WAV" },
  },
  {
    id: "DEMO-1034",
    date: "2026-08-13",
    time: "08:18",
    severity: "Low",
    confidence: 0.79,
    symptoms: ["sore throat"],
    status: "Archived",
    transcript:
      "Sample demonstration transcript. Caller reports a sore throat and mild discomfort while swallowing.",
    audio: { filename: "demo_call_1034.m4a", duration: "00:31", format: "M4A" },
  },
];
