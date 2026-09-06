import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_CASES } from "@/data/demoCases";
import { severityStyles, SEVERITY_LEVELS, type Severity } from "@/lib/severity";
import { cn } from "@/lib/utils";
import { AudioLines, Server, CircleDot, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dispatcher Dashboard — Emergency Severity Assessment" },
      {
        name: "description",
        content:
          "Decision-support dashboard for automated patient severity assessment from emergency healthcare calls using NLP and ClinicalBERT.",
      },
      { property: "og:title", content: "Emergency Call Severity Assessment Dashboard" },
      {
        property: "og:description",
        content:
          "Academic prototype dashboard for AI-assisted severity triage of emergency healthcare calls.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const counts = SEVERITY_LEVELS.reduce(
    (acc, level) => {
      acc[level] = DEMO_CASES.filter((c) => c.severity === level).length;
      return acc;
    },
    {} as Record<Severity, number>,
  );

  return (
    <AppLayout
      title="Emergency Dispatcher Dashboard"
      subtitle="Automated Patient Severity Assessment from Emergency Healthcare Calls Using NLP"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-lg font-semibold">
                Decision support for emergency dispatch personnel
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This prototype interface is designed to receive an emergency call
                recording, produce a Speech-to-Text transcript, extract medically
                relevant symptoms, and suggest one of four severity tiers. The AI
                pipeline is not yet connected — all figures below come from labelled
                demonstration records.
              </p>
            </div>
            <Button asChild>
              <Link to="/analyze">
                <AudioLines className="mr-2 h-4 w-4" />
                Analyze a call
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="System Status"
            value="Interface Ready"
            hint="Speech-to-Text & ClinicalBERT: not connected"
            icon={<Server className="h-4 w-4" />}
          />
          <StatCard
            label="Total Cases Analyzed"
            value={String(DEMO_CASES.length)}
            hint="Demonstration records only"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            label="Pending Review"
            value={String(
              DEMO_CASES.filter((c) => c.status === "Pending Review").length,
            )}
            hint="Demo workflow state"
            icon={<CircleDot className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SEVERITY_LEVELS.map((level) => (
            <Card key={level} className={cn("border-l-4", severityStyles[level].ring)}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("h-2 w-2 rounded-full", severityStyles[level].dot)}
                    aria-hidden
                  />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {level} cases
                  </p>
                </div>
                <p className="mt-2 font-mono text-3xl font-semibold">{counts[level]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {severityStyles[level].label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recent Emergency Cases
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Demonstration data — no real patients or calls.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/history">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {DEMO_CASES.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                to="/history/$caseId"
                params={{ caseId: c.id }}
                className="flex flex-wrap items-center gap-3 py-3 transition-colors hover:bg-secondary/60"
              >
                <span className="font-mono text-sm">{c.id}</span>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-medium",
                    severityStyles[c.severity].badge,
                  )}
                >
                  {c.severity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {c.symptoms.length} symptoms
                </span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {c.date} · {c.time}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
        </div>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
