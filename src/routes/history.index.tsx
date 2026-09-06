import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_CASES } from "@/data/demoCases";
import { severityStyles, SEVERITY_LEVELS } from "@/lib/severity";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Search } from "lucide-react";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "Call History — Analyzed Emergency Cases" },
      {
        name: "description",
        content:
          "Searchable table of demonstration emergency call cases with severity, confidence and symptom counts.",
      },
      { property: "og:title", content: "Call History — Demonstration Case Records" },
      {
        property: "og:description",
        content:
          "Browse, filter and sort demonstration emergency call severity records.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [desc, setDesc] = useState(true);

  const rows = useMemo(() => {
    return DEMO_CASES.filter((c) => {
      const matchesQuery =
        !query ||
        c.id.toLowerCase().includes(query.toLowerCase()) ||
        c.symptoms.some((s) => s.toLowerCase().includes(query.toLowerCase()));
      const matchesSeverity = severity === "all" || c.severity === severity;
      return matchesQuery && matchesSeverity;
    }).sort((a, b) => {
      const av = `${a.date} ${a.time}`;
      const bv = `${b.date} ${b.time}`;
      return desc ? bv.localeCompare(av) : av.localeCompare(bv);
    });
  }, [query, severity, desc]);

  return (
    <AppLayout title="Call History" subtitle="Previously analyzed cases (demonstration data)">
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Case Records
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              All rows are synthetic demonstration records. No real patient names,
              contact details, addresses or medical identifiers are used.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by case ID or symptom"
                className="pl-9"
              />
            </div>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                {SEVERITY_LEVELS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setDesc((v) => !v)}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Date {desc ? "newest" : "oldest"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Symptoms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.id}</TableCell>
                  <TableCell className="font-mono text-sm">{c.date}</TableCell>
                  <TableCell className="font-mono text-sm">{c.time}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-xs font-medium",
                        severityStyles[c.severity].badge,
                      )}
                    >
                      {c.severity}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {(c.confidence * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-sm">{c.symptoms.length}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.status}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/history/$caseId" params={{ caseId: c.id }}>
                        Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No cases match the current search or filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
