import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { parseJson } from "@/lib/ai";
import { Thinking } from "@/components/ai-status";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { compact, formatDate } from "@/lib/format";
import { useHQ } from "@/lib/store";
import type { Release, RolloutPlan } from "@/lib/types";
import { useTeam } from "@/lib/use-team";

export const Route = createFileRoute("/music")({
  validateSearch: (s: Record<string, unknown>) => ({
    release: typeof s.release === "string" ? s.release : undefined,
  }),
  component: MusicPage,
});

type RolloutShape = Omit<RolloutPlan, "releaseId" | "createdAt">;

function MusicPage() {
  const search = Route.useSearch();
  const releases = useHQ((s) => s.releases);
  const rollouts = useHQ((s) => s.rollouts);
  const saveRollout = useHQ((s) => s.saveRollout);
  const { ask, loading, error } = useTeam();
  const [openId, setOpenId] = useState(search.release ?? "");

  const upcoming = releases.filter((r) => r.status === "upcoming");
  const focus = upcoming[0] ?? releases[0];
  const out = releases.filter((r) => r.id !== focus?.id);

  async function build(release: Release) {
    setOpenId(release.id);
    const text = await ask(
      "rollout",
      `Keep "${release.title}" moving for the next 30 days. Status: ${release.status}. Date: ${release.releaseDate}. Atlanta show is Aug 29. Republic NOLA just happened. Inner circle first, then public. If this song is already out, treat it as keep-pushing — do not invent a fake next single.`,
    );
    if (!text) return;
    const parsed = parseJson<RolloutShape>(text);
    if (!parsed) return;
    saveRollout({
      ...parsed,
      releaseId: release.id,
      createdAt: new Date().toISOString(),
    });
  }

  const active = useMemo(
    () => rollouts.find((r) => r.releaseId === openId),
    [rollouts, openId],
  );

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="The catalog" title="My Music" />
        <div className="space-y-6 px-5">
          {focus ? (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {focus.status === "upcoming" ? "Upcoming" : "Keep pushing"}
              </p>
              <ReleaseCard
                release={focus}
                onBuild={() => build(focus)}
                loading={loading && openId === focus.id}
              />
            </div>
          ) : null}

          {loading ? <Thinking label="Building the 30-day plan" /> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          {active ? <RolloutView plan={active} /> : null}

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Released</p>
            {out.map((r) => (
              <ReleaseCard
                key={r.id}
                release={r}
                onBuild={() => build(r)}
                loading={loading && openId === r.id}
              />
            ))}
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}

function ReleaseCard({
  release,
  onBuild,
  loading,
}: {
  release: Release;
  onBuild?: () => void;
  loading?: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="flex gap-3">
        <img
          src={release.cover}
          alt={release.title}
          className="size-[4.5rem] rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-none">{release.title}</p>
          <p className="mt-1 text-xs text-muted">
            {release.status === "upcoming" ? "Drops" : "Released"} {formatDate(release.releaseDate, "MMM d, yyyy")}
          </p>
          {release.status === "released" ? (
            <div className="mt-2 flex gap-3 text-xs text-subtle">
              <span>{compact(release.streams)} streams</span>
              <span>{compact(release.saves)} saves</span>
              <span>{release.playlistAdds} playlists</span>
            </div>
          ) : null}
          <div className="mt-2 flex gap-3 text-xs">
            <a className="text-muted underline-offset-2 hover:underline" href={release.spotify} target="_blank" rel="noreferrer">
              Spotify
            </a>
            <a className="text-muted underline-offset-2 hover:underline" href={release.apple} target="_blank" rel="noreferrer">
              Apple
            </a>
            <a className="text-muted underline-offset-2 hover:underline" href={release.youtube} target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </div>
      </div>
      {onBuild ? (
        <Button className="mt-3 w-full" onClick={onBuild} disabled={loading}>
          Build My Rollout
        </Button>
      ) : null}
    </Card>
  );
}

function RolloutView({ plan }: { plan: RolloutPlan }) {
  return (
    <div className="space-y-3">
      <p className="font-display text-3xl leading-none">{plan.headline || "30-day rollout"}</p>
      {plan.days?.length ? (
        <Card>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">30-day plan</p>
          <ol className="mt-3 space-y-3">
            {plan.days.map((d) => (
              <li key={d.day} className="grid grid-cols-[2.5rem_1fr] gap-2">
                <span className="text-xs text-subtle">Day {d.day}</span>
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-sm text-muted">{d.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}
      <List title="Teaser ideas" items={plan.teasers} />
      <List title="Caption ideas" items={plan.captions} />
      <List title="Video ideas" items={plan.videos} />
      <List title="Release-day plan" items={plan.releaseDay} />
      <List title="Follow-up campaign" items={plan.followUp} />
      <List title="Fan text campaign" items={plan.fanTexts} />
      <List title="Email campaign" items={plan.emails} />
    </div>
  );
}

function List({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
