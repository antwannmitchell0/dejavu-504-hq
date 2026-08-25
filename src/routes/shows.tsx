import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/shows")({ component: ShowsPage });

function ShowsPage() {
  const shows = useHQ((s) => s.shows);
  const upcoming = shows.filter((s) => s.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const past = shows.filter((s) => s.status === "past").sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Rooms" title="Shows" />
        <div className="space-y-6 px-5">
          <section className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Upcoming</p>
            {upcoming.map((s) => (
              <Card key={s.id} className="p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  {formatDate(s.date, "EEEE, MMM d")} · {s.time}
                </p>
                <p className="font-display text-3xl leading-none">{s.city}</p>
                <p className="mt-1 text-sm text-muted">{s.venue}</p>
                <p className="mt-2 text-xs text-subtle">Expected {s.expectedAttendance}</p>
                {s.notes ? <p className="mt-2 text-sm text-fg">{s.notes}</p> : null}
                <Button asChild className="mt-3 w-full">
                  <Link to="/show-mode" search={{ show: s.id }}>
                    Show Mode
                  </Link>
                </Button>
              </Card>
            ))}
          </section>
          <section className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Past</p>
            {past.map((s) => (
              <Card key={s.id} className="p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  {formatDate(s.date, "EEE, MMM d")}
                </p>
                <p className="font-display text-2xl leading-none">{s.city}</p>
                <p className="mt-1 text-sm text-muted">{s.venue}</p>
                <p className="mt-2 text-xs text-subtle">
                  {s.actualAttendance} in the room · {s.fansCaptured} fans captured
                </p>
                {s.notes ? <p className="mt-2 text-sm text-muted">{s.notes}</p> : null}
              </Card>
            ))}
          </section>
        </div>
      </Screen>
    </AppShell>
  );
}
