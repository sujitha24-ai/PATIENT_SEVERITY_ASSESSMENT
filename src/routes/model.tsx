import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";

export const Route = createFileRoute("/model")({
  head: () => ({
    meta: [
      { title: "Model Information — Planned AI Pipeline" },
      {
        name: "description",
        content:
          "Planned Speech-to-Text, NLP preprocessing and ClinicalBERT pipeline for emergency call severity classification.",
      },
      { property: "og:title", content: "Planned AI Pipeline — ClinicalBERT Severity Model" },
      {
        property: "og:description",
        content:
          "Architecture and component roles for the emergency call severity assessment pipeline.",
      },
    ],
  }),
  component: ModelInfo,
});

const STAGES = [
  { name: "Emergency Call Audio", status: "Input" },
  { name: "Speech-to-Text", status: "Planned" },
  { name: "Transcript", status: "Data" },
  { name: "NLP Preprocessing", status: "Planned" },
  { name: "ClinicalBERT", status: "Planned" },
  { name: "Severity Classification", status: "Planned" },
  { name: "Critical / High / Moderate / Low", status: "Output" },
];

const COMPONENTS = [
  {
    title: "Speech-to-Text",
    body: "Converts emergency call audio into text so that the spoken report can be processed by language models.",
  },
  {
    title: "NLP Preprocessing",
    body: "Cleans and normalises the transcript and identifies medically relevant information such as reported symptoms.",
  },
  {
    title: "ClinicalBERT",
    body: "A clinical-language transformer model that will be fine-tuned for emergency severity classification on clinical text.",
  },
  {
    title: "Severity Classifier",
    body: "Produces one of four predefined severity categories: Critical, High, Moderate or Low, along with a confidence score.",
  },
];

function ModelInfo() {
  return (
    <AppLayout
      title="Model Information"
      subtitle="Planned AI pipeline — backend integration pending"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pipeline Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1">
              {STAGES.map((s, i) => (
                <li key={s.name}>
                  <div className="rounded-md border border-border bg-secondary/50 px-3 py-2.5">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.status === "Planned"
                        ? "Planned / Backend Integration Pending"
                        : s.status}
                    </p>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
              None of the AI components below are trained, validated or connected in
              this build. No accuracy figures are claimed. The interface exists so
              that the Python backend can be attached through the service layer
              without redesigning the frontend.
            </CardContent>
          </Card>
          {COMPONENTS.map((c) => (
            <Card key={c.title}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{c.title}</CardTitle>
                <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                  Planned / Backend Integration Pending
                </span>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expected backend response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md border border-border bg-secondary/50 p-3 font-mono text-xs">
{`{
  "transcript": "...",
  "severity": "Critical",
  "confidence": 0.94,
  "symptoms": ["chest pain", "breathing difficulty"]
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
