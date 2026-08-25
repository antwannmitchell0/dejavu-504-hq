import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { PageHeader, Stat } from "@/components/chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, fullName } from "@/lib/format";
import { FAN_SOURCES } from "@/lib/seed";
import { mostEngaged, sourceBreakdown, topCities, useHQ } from "@/lib/store";

export const Route = createFileRoute("/fans")({ component: FansPage });

function FansPage() {
  const fans = useHQ((s) => s.fans);
  const metrics = useHQ((s) => s.metrics);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("All");

  const cities = topCities(fans);
  const sources = sourceBreakdown(fans);
  const engaged = mostEngaged(fans, 4);

  const filtered = useMemo(() => {
    return fans.filter((f) => {
      const hay = `${f.firstName} ${f.lastName} ${f.city} ${f.tags.join(" ")}`.toLowerCase();
      const matchesQ = !q || hay.includes(q.toLowerCase());
      const matchesS = source === "All" || f.source === source;
      return matchesQ && matchesS;
    });
  }, [fans, q, source]);

  return (
    <AppShell>
      <Screen>
        <PageHeader
          kicker="Owned audience"
          title="My Fans"
          action={
            <Button asChild size="sm">
              <Link to="/capture">
                <QrCode className="size-3.5" />
                Capture
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-2.5 px-5">
          <Stat label="Total fans" value={metrics.totalFans.toLocaleString()} />
          <Stat label="New this week" value={String(metrics.newThisWeek)} />
          <Stat label="Phone numbers" value={metrics.phones.toLocaleString()} />
          <Stat label="Emails" value={metrics.emails.toLocaleString()} />
        </div>

        <div className="mt-5 px-5">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Top cities</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cities.map((c) => (
              <div key={c.city} className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs shadow-card">
                {c.city} · {c.count}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 px-5">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Most engaged</p>
          <div className="space-y-2">
            {engaged.map((f) => (
              <Link
                key={f.id}
                to="/fans/$fanId"
                params={{ fanId: f.id }}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 shadow-card"
              >
                <span className="text-sm">{fullName(f.firstName, f.lastName)}</span>
                <span className="text-xs text-muted">{f.tags[0] ?? f.city}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 px-5">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Source of signup</p>
          <div className="space-y-1.5">
            {sources.map((s) => (
              <div key={s.source} className="flex items-center justify-between text-sm">
                <span className="text-muted">{s.source}</span>
                <span className="tabular">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 px-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search fans"
              className="pl-9"
            />
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {["All", ...FAN_SOURCES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`h-8 shrink-0 rounded-full px-3 text-xs ${
                  source === s ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2 px-5">
          {filtered.map((f) => (
            <Link
              key={f.id}
              to="/fans/$fanId"
              params={{ fanId: f.id }}
              className="block rounded-xl bg-surface px-3 py-3 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{fullName(f.firstName, f.lastName)}</p>
                  <p className="text-xs text-muted">
                    {f.city || "—"} · {f.source} · {formatDate(f.joinedAt, "MMM d")}
                  </p>
                </div>
                {f.fromLastShow && !f.lastContactedAt ? (
                  <Badge>Last night</Badge>
                ) : null}
              </div>
              {f.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.tags.slice(0, 3).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>

        <p className="px-5 pt-4 text-center text-xs text-subtle">
          Showing {filtered.length} recent fans of {metrics.totalFans.toLocaleString()}
        </p>
      </Screen>
    </AppShell>
  );
}
