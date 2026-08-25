import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, SectionLabel, Stat } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { compact, formatDate } from "@/lib/format";
import { pathOf, searchOf } from "@/lib/href";
import { computeNextMoves } from "@/lib/next-move";
import { mostEngaged, topCities, useHQ } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const artist = useHQ((s) => s.artist);
  const metrics = useHQ((s) => s.metrics);
  const fans = useHQ((s) => s.fans);
  const releases = useHQ((s) => s.releases);
  const shows = useHQ((s) => s.shows);
  const activity = useHQ((s) => s.activity);
  const lastNightUntexted = useHQ((s) => s.lastNightUntexted);
  const team = useHQ((s) => s.team);

  const priority = computeNextMoves({
    fans,
    shows,
    releases,
    team,
    lastNightUntexted,
  })[0];
  const upcomingShow = [...shows]
    .filter((s) => s.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextRelease = releases.find((r) => r.status === "upcoming");
  const focusRelease = nextRelease ?? releases[0];
  const cities = topCities(fans);
  const engaged = mostEngaged(fans, 3);
  const maxDay = Math.max(...metrics.signupsByDay, 1);

  return (
    <AppShell>
      <Screen>
        <section className="relative h-[420px] overflow-hidden">
          <img
            src={artist.photo}
            alt={artist.name}
            className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <span className="inline-block rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-fg">
              Slime Princess
            </span>
            <h1 className="mt-2 font-display text-6xl italic leading-none text-fg">{artist.name}</h1>
            <p className="mt-2 max-w-[20rem] text-sm leading-relaxed text-muted">
              Build your fanbase. Own your audience. Grow your career.
            </p>
          </div>
        </section>

        <div className="stagger space-y-5 pt-5">
          <div className="px-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Today's priority</p>
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: pathOf(priority.href),
                  search: searchOf(priority.href),
                } as never)
              }
              className="mt-2 block w-full rounded-xl bg-accent p-4 text-left text-accent-fg transition-transform duration-150 active:scale-[0.98]"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">Do this next</p>
              <p className="mt-1 font-display text-[1.85rem] italic leading-[1.1]">{priority.title}</p>
              <p className="mt-2 text-sm opacity-75">{priority.why}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                {priority.cta} <ArrowRight className="size-4" />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 px-5">
            <Stat
              label="Fan growth"
              value={compact(metrics.totalFans)}
              hint={`+${metrics.newThisWeek} this week`}
            />
            <Stat
              label="New signups"
              value={String(metrics.newThisWeek)}
              hint="Inner circle this week"
            />
          </div>

          <div className="px-5">
            <Card className="bg-elevated">
              <p className="font-display text-[1.85rem] italic leading-[1.1]">163K on Instagram.</p>
              <p className="mt-1 font-display text-[1.85rem] italic leading-[1.1]">
                {compact(metrics.totalFans)} you can actually text.
              </p>
              <p className="mt-2 text-xs text-muted">Followers fade. Phones don't.</p>
            </Card>
          </div>

          <div className="px-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">This week</p>
            <div className="flex h-16 items-end gap-1.5 rounded-xl bg-surface px-3 py-3 shadow-card">
              {metrics.signupsByDay.map((n, i) => (
                <div key={i} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className="w-full rounded-sm bg-accent"
                    style={{ height: `${Math.max(8, (n / maxDay) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-subtle">
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
            </div>
          </div>

          {focusRelease ? (
            <div className="px-5">
              <SectionLabel>{nextRelease ? "Upcoming release" : "In rotation"}</SectionLabel>
              <Link to="/music" search={{ release: focusRelease.id }} className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-card">
                <img
                  src={focusRelease.cover}
                  alt={focusRelease.title}
                  className="size-16 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                    {nextRelease ? "New single" : "Keep pushing"}
                  </p>
                  <p className="font-display text-2xl italic leading-none">{focusRelease.title}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {nextRelease
                      ? formatDate(focusRelease.releaseDate, "MMMM d")
                      : `${compact(focusRelease.streams)} streams`}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted" />
              </Link>
            </div>
          ) : null}

          <div className="px-5">
            <SectionLabel>Content to post today</SectionLabel>
            <Card>
              <p className="text-sm text-fg">Encore clip from Republic NOLA. The room was over the number.</p>
              <p className="mt-1 text-xs text-muted">Talk to camera for 12 seconds, then cut to the crowd.</p>
              <Button asChild variant="secondary" size="sm" className="mt-3">
                <Link to="/create" search={{ activity: "Performed at Republic NOLA last night" }}>
                  Create my content for today
                </Link>
              </Button>
            </Card>
          </div>

          {upcomingShow ? (
            <div className="px-5">
              <SectionLabel>Upcoming events</SectionLabel>
              <Link to="/shows" className="block rounded-xl bg-surface p-4 shadow-card">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  {formatDate(upcomingShow.date, "EEEE")}
                </p>
                <p className="font-display text-3xl italic leading-none">
                  {upcomingShow.city}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {upcomingShow.venue} · {upcomingShow.time}
                </p>
                <p className="mt-2 text-xs text-subtle">
                  Expected {upcomingShow.expectedAttendance} · guest list with Dre
                </p>
              </Link>
            </div>
          ) : null}

          <div className="px-5">
            <SectionLabel>Where your people are</SectionLabel>
            <div className="space-y-2">
              {cities.map((c) => (
                <div key={c.city} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 shadow-card">
                  <span className="text-sm">{c.city}</span>
                  <span className="text-sm tabular text-muted">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5">
            <SectionLabel>Recent activity</SectionLabel>
            <div className="space-y-2">
              {activity.slice(0, 4).map((a) => (
                <div key={a.id} className="rounded-lg bg-surface px-3 py-2.5 shadow-card">
                  <p className="text-sm text-fg">{a.title}</p>
                  <p className="text-xs text-muted">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5">
            <SectionLabel>Most engaged</SectionLabel>
            <div className="space-y-2">
              {engaged.map((f) => (
                <Link
                  key={f.id}
                  to="/fans/$fanId"
                  params={{ fanId: f.id }}
                  className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 shadow-card"
                >
                  <span className="text-sm">
                    {f.firstName} {f.lastName}
                  </span>
                  <span className="text-xs text-muted">{f.city}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="px-5">
            <SectionLabel>Quick actions</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5">
              <Button asChild size="lg" className="h-auto flex-col items-start gap-1 py-3">
                <Link to="/capture">
                  <QrCode className="size-4" />
                  <span>Capture a Fan</span>
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-auto flex-col items-start gap-1 py-3">
                <Link to="/follow-up" search={{ intent: "last-night", fanId: undefined }}>
                  Text last night
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-auto flex-col items-start gap-1 py-3">
                <Link to="/create" search={{ activity: undefined }}>
                  Create content
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-auto flex-col items-start gap-1 py-3">
                <Link to="/show-mode" search={{ show: undefined }}>
                  Show Mode
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-5 pb-2">
            <Link
              to="/advisor"
              className="flex items-center justify-between rounded-xl bg-elevated px-4 py-3.5 shadow-card"
            >
              <span className="inline-flex items-center gap-2 text-sm">
                <Sparkles className="size-4" />
                Ask My Team
              </span>
              <ArrowRight className="size-4 text-muted" />
            </Link>
            <p className="mt-4 text-center text-xs leading-relaxed text-subtle">
              Stop building followers you don't own.
              <br />
              Build fans you can reach anytime.
            </p>
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}
