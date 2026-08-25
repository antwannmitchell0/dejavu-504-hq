import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Textarea } from "@/components/ui/textarea";
import { phonePretty } from "@/lib/format";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/team")({ component: TeamPage });

function TeamPage() {
  const team = useHQ((s) => s.team);
  const updateTeam = useHQ((s) => s.updateTeam);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Your people" title="Team" />
        <div className="space-y-2.5 px-5">
          {team.map((m) => {
            const expanded = open === m.id;
            return (
              <Card key={m.id} className="p-0">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  onClick={() => setOpen(expanded ? null : m.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted">{m.role}</p>
                  </div>
                  {m.followUp ? (
                    <span className="rounded-full bg-elevated px-2 py-1 text-[10px] uppercase tracking-wider text-warn">
                      Follow up
                    </span>
                  ) : null}
                </button>
                {expanded ? (
                  <div className="space-y-2 border-t border-border px-4 pb-4 pt-3">
                    {m.phone ? <p className="text-sm">{phonePretty(m.phone)}</p> : null}
                    {m.email ? <p className="text-sm text-muted">{m.email}</p> : null}
                    <p className="text-sm leading-relaxed">{m.notes}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Follow-up reminder</p>
                    <Textarea
                      defaultValue={m.followUp}
                      onBlur={(e) => updateTeam(m.id, { followUp: e.target.value })}
                      placeholder="Nothing pending"
                      className="min-h-20"
                    />
                  </div>
                ) : m.followUp ? (
                  <p className="px-4 pb-4 text-xs text-muted">{m.followUp}</p>
                ) : null}
              </Card>
            );
          })}
        </div>
      </Screen>
    </AppShell>
  );
}
