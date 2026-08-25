import { createFileRoute, Link } from "@tanstack/react-router";
import { parseJson } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/press")({ component: PressPage });

type PressShape = {
  headline?: string;
  bio?: string;
  shortBio?: string;
  quotes?: string[];
  highlights?: string[];
  techRider?: string;
  bookingBlurb?: string;
};

function PressPage() {
  const artist = useHQ((s) => s.artist);
  const shows = useHQ((s) => s.shows);
  const releases = useHQ((s) => s.releases);
  const stored = useHQ((s) => s.pressKit);
  const generated = stored ? parseJson<PressShape>(stored) : null;

  const upcoming = shows.filter((s) => s.status === "upcoming");
  const songs = releases.filter((r) => r.status === "released");

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] bg-bg px-5 pb-16 pt-8 text-fg">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Press kit</p>
      <h1 className="font-display text-6xl italic leading-none">{artist.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {generated?.headline ?? `${artist.genre} · ${artist.hometown}`}
      </p>

      <img
        src={artist.photo}
        alt={artist.name}
        className="mt-6 h-80 w-full rounded-xl object-cover object-top"
      />

      <p className="mt-6 text-sm leading-relaxed">
        {generated?.bio ?? artist.bio}
      </p>

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">Highlights</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {(generated?.highlights?.length
            ? generated.highlights
            : [
                "163K on Instagram. 1,247 fans she can actually text.",
                "Republic NOLA over capacity — 180 in a 160 room",
                "5 Signs of a Fake B out July 2026",
                "Independent. Self-run. Inner circle first.",
              ]
          ).map((h) => (
            <li key={h} className="border-b border-border py-2">
              {h}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">Music</h2>
        <div className="mt-3 space-y-2">
          {songs.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <img src={s.cover} alt="" className="size-12 rounded-sm object-cover" />
              <div>
                <p className="text-sm">{s.title}</p>
                <p className="text-xs text-muted">{formatDate(s.releaseDate, "yyyy")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">Upcoming rooms</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {upcoming.map((s) => (
            <li key={s.id}>
              {formatDate(s.date, "MMM d")} — {s.venue}, {s.city}
            </li>
          ))}
        </ul>
      </section>

      {generated?.quotes?.length ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">Press</h2>
          {generated.quotes.map((q) => (
            <blockquote key={q} className="font-display text-2xl italic leading-snug">
              {q}
            </blockquote>
          ))}
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">Booking</h2>
        <p className="mt-2 text-sm">{generated?.bookingBlurb ?? "Available for rooms, festivals, and private events."}</p>
        <p className="mt-2 text-sm">{artist.bookingEmail}</p>
        <p className="text-sm text-muted">{artist.bookingPhone}</p>
        <p className="mt-3 text-sm">{artist.pressEmail}</p>
      </section>

      <div className="mt-10 flex gap-2">
        <Button asChild variant="secondary" className="flex-1">
          <Link to="/brand">Back to brand</Link>
        </Button>
        <Button asChild className="flex-1">
          <a href={artist.spotify} target="_blank" rel="noreferrer">
            Listen
          </a>
        </Button>
      </div>
    </div>
  );
}
