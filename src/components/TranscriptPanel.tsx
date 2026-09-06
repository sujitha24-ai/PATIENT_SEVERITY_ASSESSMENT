import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Pencil } from "lucide-react";

const PLACEHOLDER = "Transcript will appear here after Speech-to-Text processing.";

export function TranscriptPanel({
  transcript,
  onChange,
  readOnly = false,
}: {
  transcript: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Speech-to-Text Transcript
        </CardTitle>
        <div className="flex gap-2">
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing((v) => !v)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              {editing ? "Done" : "Edit"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copy} disabled={!transcript}>
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {editing && !readOnly ? (
          <Textarea
            value={transcript}
            onChange={(e) => onChange?.(e.target.value)}
            rows={7}
            className="font-mono text-sm"
          />
        ) : (
          <div className="min-h-32 rounded-md border border-border bg-secondary/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {transcript || (
              <span className="text-muted-foreground">{PLACEHOLDER}</span>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {transcript.length} characters · {words} words
        </p>
      </CardContent>
    </Card>
  );
}
