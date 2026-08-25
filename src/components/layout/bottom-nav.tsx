import { Link, useRouterState } from "@tanstack/react-router";
import { Disc3, House, Menu, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  { to: "/fans", label: "Fans", icon: Users, match: (p: string) => p.startsWith("/fans") || p.startsWith("/follow-up") || p.startsWith("/capture") },
  { to: "/create", label: "Create", icon: Sparkles, match: (p: string) => p.startsWith("/create") },
  { to: "/music", label: "Music", icon: Disc3, match: (p: string) => p.startsWith("/music") },
  { to: "/more", label: "More", icon: Menu, match: (p: string) => ["/more", "/shows", "/money", "/brand", "/team", "/settings", "/next", "/advisor"].some((x) => p === x || p.startsWith(x + "/")) },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 px-1 pt-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide transition-colors duration-150",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    active && "bg-accent text-accent-fg",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
