import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymptomTags } from "@/components/SymptomTags";
import { severityStyles, type Severity } from "@/lib/severity";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface SeverityResultProps {
  severity?: Severity | undefined;
  confidence?: number | undefined;
  symptoms?: string[] | undefined;
  timestamp?: string | undefined;
  modelStatus?: string | undefined;
  probabilities?: Partial<Record<Severity, number>> | undefined;
}

const PROBABILITY_ORDER: Severity[] = ["Critical", "High", "Moderate", "Low"];

export function SeverityResult({
  severity,
  confidence,
  symptoms,
  timestamp,
  modelStatus = "Backend integration pending",
  probabilities,
}: SeverityResultProps) {
  const style = severity ? severityStyles[severity] : null;

  return (
    <Card className={cn(style && "border-l-4", style?.ring)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Severity Assessment
        </CardTitle>
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
          {modelStatus}
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Predicted Severity">
            {severity ? (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold",
                  style!.badge,
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", style!.dot)} aria-hidden />
                {severity.toUpperCase()}
              </span>
            ) : (
              <Empty>Awaiting model output</Empty>
            )}
          </Field>

          <Field label="Confidence Score">
            {confidence != null ? (
              <div className="space-y-1.5">
                <p className="font-mono text-2xl font-semibold text-foreground">
                  {(confidence * 100).toFixed(1)}%
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", style?.dot ?? "bg-primary")}
                    style={{ width: `${Math.min(100, confidence * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <Empty>—</Empty>
            )}
          </Field>

          <Field label="Analysis Time">
            {timestamp ? (
              <p className="font-mono text-sm text-foreground">{timestamp}</p>
            ) : (
              <Empty>Not analyzed yet</Empty>
            )}
          </Field>
        </div>

        {probabilities && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class Probabilities
            </p>
            <div className="space-y-2">
              {PROBABILITY_ORDER.filter((level) => probabilities[level] != null).map(
                (level) => {
                  const p = probabilities[level] ?? 0;
                  const levelStyle = severityStyles[level];
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
                        {level}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", levelStyle.dot)}
                          style={{ width: `${Math.min(100, p * 100)}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right font-mono text-xs text-foreground">
                        {(p * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Detected Symptoms
          </p>
          <SymptomTags symptoms={symptoms} />
        </div>

        <p className="flex items-start gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Severity levels are decision-support suggestions only. Final triage
          decisions must be made by qualified emergency personnel.
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
