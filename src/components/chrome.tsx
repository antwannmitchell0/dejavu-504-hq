import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  kicker,
  back,
  action,
}: {
  title: string;
  kicker?: string;
  back?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-6">
      <div className="min-w-0">
        {back ? (
          <Link
            to={back as never}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted"
          >
            <ChevronLeft className="size-3.5" />
            Back
          </Link>
        ) : null}
        {kicker ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{kicker}</p>
        ) : null}
        <h1 className="font-display text-[2.35rem] italic leading-[1.05] text-fg">{title}</h1>
      </div>
      {action ? <div className="shrink-0 pb-1">{action}</div> : null}
    </header>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn("rounded-xl bg-surface p-4 shadow-card", className);
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, "w-full text-left")}>
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3 shadow-card">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl italic leading-none tabular text-fg">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted">{children}</p>
  );
}

export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-8 text-center shadow-card">
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  );
}
