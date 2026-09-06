import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AudioLines,
  History,
  Cpu,
  Info,
  ShieldAlert,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/analyze", label: "Analyze Call", icon: AudioLines },
  { to: "/history", label: "Call History", icon: History },
  { to: "/model", label: "Model Information", icon: Cpu },
  { to: "/about", label: "About Project", icon: Info },
] as const;

export function AppLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <ShieldAlert className="h-5 w-5 text-sidebar-primary" aria-hidden />
          <div className="leading-tight">
            <p className="text-sm font-semibold">SeverityAssist</p>
            <p className="text-[11px] text-sidebar-foreground/60">
              Emergency Decision Support
            </p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-sidebar-border p-4">
          <p className="text-[11px] leading-relaxed text-sidebar-foreground/55">
            Academic prototype. AI backend integration pending. Not a medical device.
          </p>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="rounded-md border border-border p-2 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground lg:text-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-sev-low" aria-hidden />
            <span className="text-xs text-muted-foreground">
              Interface online · Model offline
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground lg:px-8">
          This system provides AI-assisted decision support and does not replace
          professional medical judgment.
        </footer>
      </div>
    </div>
  );
}
