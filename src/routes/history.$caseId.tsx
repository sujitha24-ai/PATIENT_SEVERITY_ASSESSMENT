import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeverityResult } from "@/components/SeverityResult";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { DEMO_CASES } from "@/data/demoCases";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/history/$caseId")({
  loader: ({ params }) => {
    const record = DEMO_CASES.find((c) => c.id === params.caseId);
    if (!record) throw notFound();
    return { record };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Case unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Case ${loaderData.record.id} — Severity Details`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Demonstration case record ${loaderData.record.id} with transcript, extracted symptoms and suggested severity tier.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Demonstration emergency case detail view for severity assessment.",
        },
      ],
    };
  },
  component: CaseDetail,
  notFoundComponent: CaseNotFound,
});

function CaseDetail() {
  const { record } = Route.useLoaderData();

  return (
    <AppLayout
      title={`Case ${record.id}`}
      subtitle="Demonstration case record — not a real emergency call"
    >
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/history">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to call history
          </Link>
        </Button>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Case Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <Row label="Case ID" value={record.id} mono />
                <Row label="Timestamp" value={`${record.date} · ${record.time}`} mono />
                <Row label="Status" value={record.status} />
                <Row label="Model Status" value="Backend integration pending" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Audio Information
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <Row label="File" value={record.audio.filename} mono />
                <Row label="Duration" value={record.audio.duration} mono />
                <Row label="Format" value={record.audio.format} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-2 pt-6 text-xs leading-relaxed text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                This system provides AI-assisted decision support and does not replace
                professional medical judgment.
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <TranscriptPanel transcript={record.transcript} readOnly />
            <SeverityResult
              severity={record.severity}
              confidence={record.confidence}
              symptoms={record.symptoms}
              timestamp={`${record.date} ${record.time}`}
              modelStatus="Demonstration record"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  );
}

function CaseNotFound() {
  return (
    <AppLayout title="Case not found" subtitle="No demonstration record matches this ID">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            The requested case does not exist in the demonstration dataset.
          </p>
          <Button asChild variant="outline">
            <Link to="/history">Back to call history</Link>
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
