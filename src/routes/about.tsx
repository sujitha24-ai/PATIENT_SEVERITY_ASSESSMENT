import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project — AI & Data Science Mini Project" },
      {
        name: "description",
        content:
          "Academic mini project on automated patient severity assessment from emergency healthcare calls using NLP and ClinicalBERT.",
      },
      { property: "og:title", content: "About — Emergency Call Severity Assessment" },
      {
        property: "og:description",
        content:
          "Department of Artificial Intelligence and Data Science mini project on NLP-based emergency severity assessment.",
      },
    ],
  }),
  component: About,
});

const DETAILS = [
  {
    label: "Project",
    value:
      "Automated Patient Severity Assessment from Emergency Healthcare Calls Using Natural Language Processing",
  },
  { label: "Department", value: "Department of Artificial Intelligence and Data Science" },
  {
    label: "Institution",
    value: "New Prince Shri Bhavani College of Engineering and Technology",
  },
  { label: "Guide", value: "Mr. V. Selvakkumaran" },
];

const TEAM = ["Suguna M", "Sujitha S", "Surya BC"];

function About() {
  return (
    <AppLayout title="About Project" subtitle="Academic AI & Data Science mini project">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {DETAILS.map((d) => (
              <div key={d.label} className="py-3 first:pt-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {d.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{d.value}</p>
              </div>
            ))}
            <div className="py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Team
              </p>
              <ul className="mt-2 space-y-1">
                {TEAM.map((m) => (
                  <li key={m} className="text-sm">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                The project explores how Speech-to-Text conversion, Natural Language
                Processing and ClinicalBERT can support early severity assessment of
                emergency healthcare calls. The intended output is a suggested
                severity tier — Critical, High, Moderate or Low — together with a
                confidence score and the medically relevant terms extracted from the
                transcript.
              </p>
              <p>
                The goal is to help dispatch personnel prioritise incoming calls
                faster. It is a study prototype: the model pipeline is not trained or
                validated, and no clinical evaluation has been performed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scope and limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                This system provides AI-assisted decision support and does not replace
                professional medical judgment. It is not a diagnostic tool and is not
                connected to any emergency service.
              </p>
              <p>
                All records shown in the application are synthetic demonstration data.
                No real patient information is stored or processed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
