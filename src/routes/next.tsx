import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { parseJson } from "@/lib/ai";
import { Thinking } from "@/components/ai-status";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { computeNextMoves } from "@/lib/next-move";
import { pathOf, searchOf } from "@/lib/href";
import { useHQ } from "@/lib/store";
import type { NextMove } from "@/lib/types";
import { useTeam } from "@/lib/use-team";

export const Route = createFileRoute("/next")({ component: NextPage });

function NextPage() {
  const fans = useHQ((s) => s.fans);
  const shows = useHQ((s) => s.shows);
  const releases = useHQ((s) => s.releases);
  const team = useHQ((s) => s.team);
  const lastNightUntexted = useHQ((s) => s.lastNightUntexted);
  const local = computeNextMoves({ fans, shows, releases, team, lastNightUntexted });
  const { ask, loading, error } = useTeam();
  const [aiMoves, setAiMoves] = useState<{ title: string; why: string; cta: string }[] | null>(null);

  async function refresh() {
    const text = await ask("next", "What should Deja Vu 504 do today, ranked?");
    if (!text) return;
    const parsed = parseJson<{ moves: { title: string; why: string; cta: string }[] }>(text);
    if (parsed?.moves) setAiMoves(parsed.moves);
  }

  const moves: NextMove[] =
    aiMoves?.map((m, i) => ({
      ...m,
      href: local[i]?.href ?? "/advisor",
    })) ?? local;

  return (
    <AppShell>
      <Screen>
        <PageHeader
          kicker="Always know"
          title="My Next Move"
          action={
            <Button size="sm" variant="secondary" onClick={refresh} disabled={loading}>
              Ask My Team
            </Button>
          }
        />
        <div className="space-y-3 px-5">
          <p className="text-sm text-muted">
            You should never wonder what to do next. Here's the order.
          </p>
          {loading ? <Thinking label="Reading the room" /> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {moves.map((m, i) => (
            <Link
              key={m.title}
              to={pathOf(m.href) as never}
              search={searchOf(m.href) as never}
              className="block rounded-xl bg-surface p-4 shadow-card"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {i === 0 ? "Your next best move is" : `Then`}
              </p>
              <p className="mt-1 font-display text-2xl leading-[1.15]">{m.title}</p>
              <p className="mt-2 text-sm text-muted">{m.why}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm">
                {m.cta} <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </Screen>
    </AppShell>
  );
}
