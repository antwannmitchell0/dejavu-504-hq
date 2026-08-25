import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { parseJson } from "@/lib/ai";
import { Thinking } from "@/components/ai-status";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHQ } from "@/lib/store";
import type { ContentPack } from "@/lib/types";
import { useTeam } from "@/lib/use-team";

export const Route = createFileRoute("/create")({
  validateSearch: (s: Record<string, unknown>) => ({
    activity: typeof s.activity === "string" ? s.activity : undefined,
  }),
  component: CreatePage,
});

const sparks = [
  "Performed at Republic NOLA",
  "Recorded a bounce record",
  "Shot a video for Nobody",
  "Went to the studio",
  "Had a radio interview",
  "Posted a 5 Signs clip",
];

type PackShape = {
  instagram: string;
  reel: string;
  tiktok: string;
  stories: string[];
  caption: string;
  fanText: string;
  bts: string;
};

function CreatePage() {
  const search = Route.useSearch();
  const [activity, setActivity] = useState(search.activity ?? "");
  const [pack, setPack] = useState<PackShape | null>(null);
  const saveContentPack = useHQ((s) => s.saveContentPack);
  const { ask, loading, error } = useTeam();

  async function generate() {
    const what = activity.trim() || "Performed at Republic NOLA last night";
    const text = await ask(
      "content",
      `What happened: ${what}. Turn this into today's content. Be specific to Deja Vu 504, New Orleans bounce, Atlanta Saturday, 5 Signs of a Fake B already out — keep pushing, do not invent a new drop.`,
    );
    if (!text) return;
    const parsed = parseJson<PackShape>(text);
    if (!parsed) {
      setPack({
        instagram: text,
        reel: "",
        tiktok: "",
        stories: [],
        caption: "",
        fanText: "",
        bts: "",
      });
      return;
    }
    setPack(parsed);
    const saved: ContentPack = { ...parsed, activity: what, createdAt: new Date().toISOString() };
    saveContentPack(saved);
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Content machine" title="Create" />
        <div className="space-y-4 px-5">
          <p className="text-sm text-muted">What happened today?</p>
          <Textarea
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Performed at a club. Recorded a song. Met another artist."
          />
          <div className="flex flex-wrap gap-1.5">
            {sparks.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActivity(s)}
                className="h-8 rounded-full bg-elevated px-3 text-xs text-muted"
              >
                {s}
              </button>
            ))}
          </div>
          <Button size="xl" className="w-full" onClick={generate} disabled={loading}>
            Create My Content For Today
          </Button>
          {loading ? <Thinking label="Turning the night into posts" /> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          {pack ? (
            <div className="space-y-3 pt-2">
              <Piece title="Instagram post" body={pack.instagram} />
              <Piece title="Reel idea" body={pack.reel} />
              <Piece title="TikTok idea" body={pack.tiktok} />
              {pack.stories?.length ? (
                <Card>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Story sequence</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
                    {pack.stories.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </Card>
              ) : null}
              <Piece title="Caption" body={pack.caption} />
              <Piece title="Fan text" body={pack.fanText} />
              <Piece title="Behind the scenes" body={pack.bts} />
            </div>
          ) : null}
        </div>
      </Screen>
    </AppShell>
  );
}

function Piece({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </Card>
  );
}
