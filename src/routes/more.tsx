import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Banknote,
  Bot,
  CalendarDays,
  ChevronRight,
  Compass,
  Palette,
  Settings,
  UsersRound,
} from "lucide-react";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/chrome";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/more")({ component: MorePage });

const links = [
  { to: "/shows", label: "Shows", detail: "Rooms, dates, Show Mode", icon: CalendarDays },
  { to: "/money", label: "Money", detail: "In, out, kept", icon: Banknote },
  { to: "/brand", label: "Brand", detail: "Photos, bio, press kit", icon: Palette },
  { to: "/team", label: "Team", detail: "Manager, producer, rooms", icon: UsersRound },
  { to: "/next", label: "My Next Move", detail: "What to do right now", icon: Compass },
  { to: "/advisor", label: "My Team", detail: "Ask the advisor anything", icon: Bot },
  { to: "/settings", label: "Settings", detail: "Artist, demo, about", icon: Settings },
] as const;

function MorePage() {
  const artist = useHQ((s) => s.artist);
  return (
    <AppShell>
      <Screen>
        <PageHeader kicker={artist.name} title="More" />
        <div className="px-5">
          <p className="mb-4 text-sm leading-relaxed text-muted">
            Stop building followers you don't own. Build fans you can reach anytime.
          </p>
          <div className="space-y-2">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center gap-3 rounded-xl bg-surface px-3 py-3 shadow-card"
                >
                  <span className="flex size-10 items-center justify-center rounded-md bg-elevated">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{l.label}</span>
                    <span className="block text-xs text-muted">{l.detail}</span>
                  </span>
                  <ChevronRight className="size-4 text-subtle" />
                </Link>
              );
            })}
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}
