import { createFileRoute, Link } from "@tanstack/react-router";
import { parseJson } from "@/lib/ai";
import { Thinking } from "@/components/ai-status";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { Card, PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { useHQ } from "@/lib/store";
import { useTeam } from "@/lib/use-team";

export const Route = createFileRoute("/brand")({ component: BrandPage });

type PressShape = {
  headline: string;
  bio: string;
  shortBio: string;
  quotes: string[];
  highlights: string[];
  techRider: string;
  bookingBlurb: string;
};

function BrandPage() {
  const artist = useHQ((s) => s.artist);
  const savePressKit = useHQ((s) => s.savePressKit);
  const { ask, loading, error } = useTeam();

  async function build() {
    const text = await ask(
      "press",
      "Build a clean electronic press kit. Independent New Orleans bounce and rap artist Deja Vu 504, the Slime Princess. Catalog already out: 5 Signs of a Fake B, Nobody, Ratchet, Pretty Gremlin, Casamigo. No label-speak. Booking-ready. Do not invent upcoming singles.",
    );
    if (!text) return;
    const parsed = parseJson<PressShape>(text);
    savePressKit(parsed ? JSON.stringify(parsed) : text);
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="How you show up" title="My Brand" />
        <div className="space-y-5 px-5">
          <div className="overflow-hidden rounded-2xl">
            <img src={artist.photo} alt={artist.name} className="h-64 w-full object-cover object-top" />
          </div>
          <div>
            <p className="font-display text-5xl italic leading-none">{artist.name}</p>
            <p className="mt-1 text-sm text-muted">
              {artist.genre} · {artist.hometown}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-fg">{artist.bio}</p>

          <div className="grid grid-cols-3 gap-2">
            {artist.photos.slice(1, 4).map((src) => (
              <img key={src} src={src} alt="" className="h-28 w-full rounded-lg object-cover" />
            ))}
          </div>

          <Card>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Colors</p>
            <div className="mt-3 flex gap-2">
              <Swatch name="Void" className="bg-bg shadow-card" />
              <Swatch name="Cream" className="bg-accent" />
              <Swatch name="Ink" className="bg-elevated shadow-card" />
            </div>
          </Card>

          <Card>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Listen</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <a href={artist.spotify} className="text-fg">Spotify</a>
              <a href={artist.apple} className="text-fg">Apple Music</a>
              <a href={artist.youtube} className="text-fg">YouTube</a>
            </div>
          </Card>

          <Card>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Social</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <a href={artist.instagram}>Instagram</a>
              <a href={artist.tiktok}>TikTok</a>
              <a href={artist.twitter}>X</a>
            </div>
          </Card>

          <Card>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Booking</p>
            <p className="mt-2 text-sm">{artist.bookingEmail}</p>
            <p className="text-sm text-muted">{artist.bookingPhone}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">Press</p>
            <p className="mt-1 text-sm">{artist.pressEmail}</p>
          </Card>

          {loading ? <Thinking label="Building the press kit" /> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={build} disabled={loading}>
              Build My Press Kit
            </Button>
            <Button asChild variant="secondary">
              <Link to="/press">Open press kit</Link>
            </Button>
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex-1">
      <div className={`h-12 rounded-md ${className}`} />
      <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-muted">{name}</p>
    </div>
  );
}
