import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Thinking } from "@/components/ai-status";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHQ } from "@/lib/store";
import type { MessageKind } from "@/lib/types";
import { useTeam } from "@/lib/use-team";

export const Route = createFileRoute("/follow-up")({
  validateSearch: (s: Record<string, unknown>) => ({
    intent: typeof s.intent === "string" ? s.intent : undefined,
    fanId: typeof s.fanId === "string" ? s.fanId : undefined,
  }),
  component: FollowUpPage,
});

const kinds: { id: MessageKind; label: string }[] = [
  { id: "text", label: "Send text" },
  { id: "email", label: "Send email" },
  { id: "announcement", label: "Announcement" },
  { id: "invite", label: "Invite to show" },
  { id: "song", label: "Announce new song" },
  { id: "exclusive", label: "Exclusive content" },
];

function FollowUpPage() {
  const search = Route.useSearch();
  const lastNightUntexted = useHQ((s) => s.lastNightUntexted);
  const fans = useHQ((s) => s.fans);
  const shows = useHQ((s) => s.shows);
  const sendMessage = useHQ((s) => s.sendMessage);
  const { ask, loading, error } = useTeam();

  const nextShow = [...shows]
    .filter((s) => s.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const defaultKind: MessageKind =
    search.intent === "invite" ? "invite" : search.intent === "last-night" ? "text" : "text";
  const defaultAudience =
    search.intent === "last-night"
      ? "Last night's fans"
      : search.intent === "invite"
        ? "Atlanta fans"
        : search.fanId
          ? "One fan"
          : "All fans with a phone";

  const [kind, setKind] = useState<MessageKind>(defaultKind);
  const [audience, setAudience] = useState(defaultAudience);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const audiences = useMemo(() => {
    const one = fans.find((f) => f.id === search.fanId);
    return [
      "Last night's fans",
      "All fans with a phone",
      "All fans with email",
      "VIP",
      "Superfans",
      "Atlanta fans",
      "New Orleans fans",
      "Houston fans",
      "Dallas fans",
      ...(one ? [`One fan`] : []),
    ];
  }, [fans, search.fanId]);

  const one = fans.find((f) => f.id === search.fanId);

  async function writeForMe() {
    const who =
      audience === "One fan" && one
        ? `${one.firstName} in ${one.city}, favorite song ${one.favoriteSong || "unknown"}`
        : audience;
    const prompt = [
      `Write a ${kind} from Deja Vu 504.`,
      `Audience: ${who}.`,
      nextShow ? `Next show: ${nextShow.venue} in ${nextShow.city}.` : "",
      lastNightUntexted ? `${lastNightUntexted} fans from last night at Republic NOLA still untexted.` : "",
      kind === "email" ? "Include a subject line on the first line as Subject: ..." : "No subject line.",
      "Keep it under 70 words for text, 120 for email.",
    ]
      .filter(Boolean)
      .join(" ");
    const text = await ask("write", prompt);
    if (!text) return;
    if (kind === "email") {
      const match = text.match(/subject:\s*(.+)/i);
      if (match) {
        setSubject(match[1].trim());
        setBody(text.replace(/subject:\s*.+\n?/i, "").trim());
        return;
      }
    }
    setBody(text);
  }

  function send() {
    if (!body.trim()) {
      toast.error("Write something first — or let My Team do it.");
      return;
    }
    sendMessage({ kind, audience, subject, body });
    toast.success(`Sent to ${audience}`);
    setBody("");
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Stay close" title="Follow-up" back="/fans" />
        <div className="space-y-5 px-5">
          {lastNightUntexted > 0 ? (
            <Card className="bg-elevated">
              <p className="text-sm text-fg">
                {lastNightUntexted} people from Republic NOLA are waiting on you.
              </p>
              <p className="mt-1 text-xs text-muted">They scanned. They opted in. Text them while the night is still theirs.</p>
            </Card>
          ) : null}

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">What to send</p>
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={`h-9 rounded-full px-3 text-xs ${
                    kind === k.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Audience</Label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-card outline-none"
            >
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                  {a === "Last night's fans" ? ` (${lastNightUntexted})` : ""}
                </option>
              ))}
            </select>
          </div>

          {kind === "email" || kind === "announcement" ? (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write in your voice — or let My Team draft it."
              className="min-h-36"
            />
          </div>

          {loading ? <Thinking label="Writing in your voice" /> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={writeForMe} disabled={loading}>
              Write It For Me
            </Button>
            <Button type="button" onClick={send} disabled={loading}>
              Send
            </Button>
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}
