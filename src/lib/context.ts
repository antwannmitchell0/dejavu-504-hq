import type { HQState } from "@/lib/store";
import { formatDate } from "@/lib/format";

export function buildAiContext(s: Pick<
  HQState,
  | "artist"
  | "metrics"
  | "fans"
  | "releases"
  | "shows"
  | "team"
  | "activity"
  | "lastNightUntexted"
  | "money"
>) {
  const upcoming = s.shows.filter((x) => x.status === "upcoming").slice(0, 3);
  const lastShow = s.shows.find((x) => x.status === "past");
  const nextSong = s.releases.find((r) => r.status === "upcoming");
  const released = s.releases.filter((r) => r.status === "released");
  const focus = nextSong ?? released[0];
  const engaged = [...s.fans]
    .sort((a, b) => b.engagement.length - a.engagement.length)
    .slice(0, 6);
  const income = s.money.filter((m) => m.kind === "income").reduce((a, b) => a + b.amount, 0);
  const expense = s.money.filter((m) => m.kind === "expense").reduce((a, b) => a + b.amount, 0);

  return [
    `Artist: ${s.artist.name}. ${s.artist.shortBio} Genre: ${s.artist.genre}. From ${s.artist.hometown}.`,
    `Owned fans: ${s.metrics.totalFans}. New this week: ${s.metrics.newThisWeek}. Phones: ${s.metrics.phones}. Emails: ${s.metrics.emails}.`,
    `Last night untexted fans: ${s.lastNightUntexted}. Last show: ${lastShow ? `${lastShow.venue}, ${lastShow.city} on ${formatDate(lastShow.date, "MMM d")} — captured ${lastShow.fansCaptured}.` : "n/a"}`,
    `Upcoming shows: ${upcoming.map((x) => `${x.city} ${formatDate(x.date, "EEE MMM d")} at ${x.venue}`).join("; ") || "none"}.`,
    `Focus: ${focus ? `${focus.title} (${focus.status} ${focus.releaseDate})` : "none"}. Do not invent upcoming singles.`,
    `Released: ${released.map((r) => `${r.title} (${r.streams.toLocaleString()} streams)`).join("; ")}.`,
    `Money YTD: income ${income}, expenses ${expense}.`,
    `Team follow-ups: ${s.team.filter((t) => t.followUp).map((t) => `${t.name} (${t.role}): ${t.followUp}`).join(" | ") || "none"}.`,
    `Most engaged fans: ${engaged.map((f) => `${f.firstName} ${f.lastName} — ${f.city}, ${f.tags.join("/")}`).join("; ")}.`,
    `Recent: ${s.activity.slice(0, 5).map((a) => a.title).join("; ")}.`,
    `Welcome text she already uses: ${s.artist.welcomeText}`,
  ].join("\n");
}
