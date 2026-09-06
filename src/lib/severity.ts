export type Severity = "Critical" | "High" | "Moderate" | "Low";

export const SEVERITY_LEVELS: Severity[] = ["Critical", "High", "Moderate", "Low"];

export interface AnalysisResult {
  transcript: string;
  severity: Severity;
  confidence: number;
  symptoms: string[];
  timestamp?: string;
  probabilities?: Partial<Record<Severity, number>> | undefined;
}

export interface CaseRecord {
  id: string;
  date: string;
  time: string;
  severity: Severity;
  confidence: number;
  symptoms: string[];
  status: "Reviewed" | "Pending Review" | "Archived";
  transcript: string;
  audio: { filename: string; duration: string; format: string };
}

export const severityStyles: Record<
  Severity,
  { badge: string; dot: string; ring: string; label: string }
> = {
  Critical: {
    badge: "bg-sev-critical/12 text-sev-critical border-sev-critical/35",
    dot: "bg-sev-critical",
    ring: "border-sev-critical/40",
    label: "Immediate response tier",
  },
  High: {
    badge: "bg-sev-high/12 text-sev-high border-sev-high/35",
    dot: "bg-sev-high",
    ring: "border-sev-high/40",
    label: "Urgent response tier",
  },
  Moderate: {
    badge: "bg-sev-moderate/12 text-sev-moderate border-sev-moderate/35",
    dot: "bg-sev-moderate",
    ring: "border-sev-moderate/40",
    label: "Standard response tier",
  },
  Low: {
    badge: "bg-sev-low/12 text-sev-low border-sev-low/35",
    dot: "bg-sev-low",
    ring: "border-sev-low/40",
    label: "Non-urgent tier",
  },
};
