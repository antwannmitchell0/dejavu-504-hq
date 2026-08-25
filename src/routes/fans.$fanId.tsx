import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime, fullName, phonePretty } from "@/lib/format";
import { FAN_TAGS } from "@/lib/seed";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/fans/$fanId")({ component: FanProfile });

function FanProfile() {
  const { fanId } = Route.useParams();
  const fan = useHQ((s) => s.fans.find((f) => f.id === fanId));
  const updateFan = useHQ((s) => s.updateFan);
  const [notes, setNotes] = useState(fan?.notes ?? "");

  if (!fan) {
    return (
      <AppShell>
        <Screen>
          <PageHeader title="Fan" back="/fans" />
          <p className="px-5 text-sm text-muted">This fan is not in the working list.</p>
        </Screen>
      </AppShell>
    );
  }

  const current = fan;

  function toggleTag(tag: string) {
    const next = current.tags.includes(tag)
      ? current.tags.filter((t) => t !== tag)
      : [...current.tags, tag];
    updateFan(current.id, { tags: next });
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader
          kicker={fan.source}
          title={fullName(fan.firstName, fan.lastName)}
          back="/fans"
        />
        <div className="space-y-4 px-5">
          <Card>
            <Row label="Phone" value={fan.phone ? phonePretty(fan.phone) : "Not collected"} />
            <Row label="Email" value={fan.email || "Not collected"} />
            <Row label="City" value={fan.city || "—"} />
            <Row label="Joined" value={formatDate(fan.joinedAt, "MMM d, yyyy")} />
            <Row label="Came from" value={fan.source} />
            <Row label="Favorite song" value={fan.favoriteSong || "—"} />
            {fan.birthday ? <Row label="Birthday" value={formatDate(fan.birthday, "MMM d")} /> : null}
          </Card>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {FAN_TAGS.map((tag) => {
                const on = fan.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`h-8 rounded-full px-3 text-xs ${
                      on ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => updateFan(fan.id, { notes })}
              placeholder="Private notes"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Engagement</p>
            <div className="space-y-2">
              {fan.engagement.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 shadow-card">
                  <div>
                    <p className="text-sm">{e.label}</p>
                    <p className="text-xs capitalize text-muted">{e.type}</p>
                  </div>
                  <p className="shrink-0 text-xs text-subtle">{formatDateTime(e.date)}</p>
                </div>
              ))}
            </div>
          </div>

          <Button asChild className="w-full">
            <Link to="/follow-up" search={{ intent: "one", fanId: fan.id }}>
              Send a follow-up
            </Link>
          </Button>

          {fan.fromLastShow ? <Badge>Captured at last night's show</Badge> : null}
        </div>
      </Screen>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm text-fg">{value}</span>
    </div>
  );
}
