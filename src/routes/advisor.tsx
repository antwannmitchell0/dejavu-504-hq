import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Thinking } from "@/components/ai-status";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTeam } from "@/lib/use-team";

export const Route = createFileRoute("/advisor")({ component: AdvisorPage });

const starters = [
  "What should I post today?",
  "How do I keep 5 Signs in rotation?",
  "What should I text my fans?",
  "How can I make money this month?",
  "What should I do after tonight's show?",
  "How do I turn 163K followers into phones?",
];

interface Turn {
  role: "you" | "team";
  text: string;
}

function AdvisorPage() {
  const { ask, loading, error } = useTeam();
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "team",
      text: "I'm My Team. I know your fans, your rooms, and what's in rotation. Ask. I'll tell you the next move.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setDraft("");
    setTurns((t) => [...t, { role: "you", text: q }]);
    const reply = await ask("advisor", q);
    setTurns((t) => [...t, { role: "team", text: reply ?? "I couldn't get that through. Try again." }]);
    queueMicrotask(() => end.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Always on" title="My Team" />
        <div className="space-y-3 px-5">
          {turns.map((t, i) => (
            <div
              key={i}
              className={
                t.role === "you"
                  ? "ml-8 rounded-xl bg-accent px-3 py-2.5 text-sm text-accent-fg"
                  : "mr-6 rounded-xl bg-surface px-3 py-2.5 text-sm leading-relaxed shadow-card"
              }
            >
              {t.role === "team" ? (
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted">My Team</p>
              ) : null}
              <p className="whitespace-pre-wrap">{t.text}</p>
            </div>
          ))}
          {loading ? <Thinking /> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div ref={end} />

          {!turns.some((t) => t.role === "you") ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full bg-elevated px-3 py-2 text-left text-xs text-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="space-y-2 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask My Team"
              className="min-h-24"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              Send
            </Button>
          </form>
        </div>
      </Screen>
    </AppShell>
  );
}
