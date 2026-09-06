export function SymptomTags({ symptoms }: { symptoms?: string[] | undefined }) {
  if (!symptoms || symptoms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Detected symptoms will appear after NLP processing.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {symptoms.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
          >
            {s}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        These are terms extracted from the transcript, not a medical diagnosis.
      </p>
    </div>
  );
}
