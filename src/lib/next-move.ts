import type { Fan, NextMove, Release, Show, TeamMember } from "@/lib/types";

export interface NextMoveInput {
  fans: Fan[];
  shows: Show[];
  releases: Release[];
  team: TeamMember[];
  lastNightUntexted: number;
}

export function computeNextMoves(s: NextMoveInput): NextMove[] {
  const moves: NextMove[] = [];
  const lastNight = s.fans.filter((f) => f.fromLastShow && !f.lastContactedAt);

  if (s.lastNightUntexted > 0 || lastNight.length > 0) {
    const n = Math.max(s.lastNightUntexted, lastNight.length);
    moves.push({
      title: `Text the ${n} fans you captured at last night's event.`,
      why: "They're still warm. Reach them before the night fades.",
      cta: "Write the text",
      href: "/follow-up?intent=last-night",
    });
  }

  const upcoming = [...s.shows]
    .filter((x) => x.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (upcoming) {
    moves.push({
      title: `Promote your ${upcoming.city} show.`,
      why: `${upcoming.venue} · ${upcoming.city}. The room fills when you talk to people you already have.`,
      cta: "Invite fans",
      href: "/follow-up?intent=invite",
    });
  }

  moves.push({
    title: "Post the performance clip.",
    why: "Chris Vale dropped last night's encore. Put it up before the algorithm forgets the room.",
    cta: "Make the post",
    href: "/create?activity=Performed%20at%20Republic%20NOLA%20last%20night",
  });

  const nextRelease =
    s.releases.find((r) => r.status === "upcoming") ?? s.releases[0];
  if (nextRelease) {
    const dropping = nextRelease.status === "upcoming";
    moves.push({
      title: dropping
        ? `Keep the ${nextRelease.title} campaign moving.`
        : `Keep ${nextRelease.title} in rotation.`,
      why: dropping
        ? `Drops ${nextRelease.releaseDate}. Tease it to the inner circle first.`
        : "It's out. Work Nobody, Ratchet, and the album to phones you already own.",
      cta: "Build the rollout",
      href: `/music?release=${nextRelease.id}`,
    });
  }

  const due = s.team.find((t) => t.followUp);
  if (due) {
    moves.push({
      title: `Follow up with ${due.name}.`,
      why: due.followUp,
      cta: "Open team",
      href: "/team",
    });
  }

  moves.push({
    title: "Record three short videos today.",
    why: "One from last night, one in the car, one talking to camera about Saturday.",
    cta: "Get the prompts",
    href: "/create",
  });

  return moves;
}
