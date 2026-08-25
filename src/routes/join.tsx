import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { artist as seedArtist } from "@/lib/seed";
import { useHQ } from "@/lib/store";
import type { FanSource } from "@/lib/types";

export const Route = createFileRoute("/join")({
  validateSearch: (s: Record<string, unknown>) => ({
    src: typeof s.src === "string" ? s.src : undefined,
  }),
  component: JoinPage,
});

const sources: FanSource[] = [
  "QR code",
  "Live show",
  "Instagram",
  "TikTok",
  "Website",
  "Referral",
  "Other",
];

function JoinPage() {
  const { src } = Route.useSearch();
  const artist = useHQ((s) => s.artist) ?? seedArtist;
  const addFan = useHQ((s) => s.addFan);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    if (!firstName) return;
    const source = (form.get("source") as FanSource) || coerceSource(src);
    addFan({
      firstName,
      lastName: String(form.get("lastName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      city: String(form.get("city") ?? ""),
      favoriteSong: String(form.get("favoriteSong") ?? ""),
      birthday: String(form.get("birthday") ?? ""),
      source,
    });
    setName(firstName);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto min-h-dvh max-w-[430px] bg-bg text-fg">
        <div className="relative h-[52dvh] overflow-hidden">
          <img src={artist.photo} alt="" className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-transparent" />
        </div>
        <div className="px-6 pb-10 pt-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Inner circle</p>
          <h1 className="font-display text-5xl leading-none italic">You're officially tapped in.</h1>
          <p className="mt-3 text-sm text-muted">
            {name ? `${name}, check` : "Check"} your phone. A welcome text is on the way.
          </p>
          <div className="mt-6 rounded-xl bg-surface p-4 shadow-card">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">From Deja Vu 504</p>
            <p className="mt-2 text-sm leading-relaxed text-fg">{artist.welcomeText}</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild>
              <a href={artist.spotify} target="_blank" rel="noreferrer">
                Listen now
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">I'm the artist</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] bg-bg text-fg">
      <div className="relative h-[46dvh] overflow-hidden">
        <img
          src={artist.photo}
          alt={artist.name}
          className="h-full w-full object-cover object-[center_18%]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-4">
          <span className="inline-block rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-fg">
            {artist.genre}
          </span>
          <h1 className="mt-2 font-display text-6xl italic leading-none">{artist.name}</h1>
          <p className="mt-1 text-sm text-muted">{artist.shortBio}</p>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="mb-5 flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <a href={artist.spotify} target="_blank" rel="noreferrer">
              Spotify
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={artist.apple} target="_blank" rel="noreferrer">
              Apple
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={artist.youtube} target="_blank" rel="noreferrer">
              YouTube
            </a>
          </Button>
        </div>

        <h2 className="font-display text-3xl italic leading-none">Join the inner circle</h2>
        <p className="mt-2 text-sm text-muted">
          Social media brings you in. This is how she reaches you anytime — new music, shows, exclusive drops.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Field label="First name" name="firstName" required placeholder="Your first name" />
          <Field label="Mobile phone" name="phone" type="tel" placeholder="(504) 555-0100" />
          <Field label="Email" name="email" type="email" placeholder="you@email.com" />
          <Field label="City" name="city" placeholder="New Orleans" />
          <Field label="Favorite song" name="favoriteSong" placeholder="Nobody" />
          <Field label="Birthday" name="birthday" type="date" optional />
          <input type="hidden" name="source" value={coerceSource(src)} />

          <label className="flex items-start gap-2.5 pt-1 text-xs leading-relaxed text-muted">
            <input
              type="checkbox"
              required
              className="mt-0.5 size-4 shrink-0 accent-accent"
            />
            I agree to receive texts and emails from Deja Vu 504 about new music, shows, and drops. Msg & data rates may apply. Reply STOP to opt out. Consent is not a condition of purchase.
          </label>

          <Button type="submit" size="xl" className="mt-2 w-full">
            Join Deja Vu 504's Inner Circle
          </Button>
        </form>
      </div>
    </div>
  );
}

function coerceSource(src: string | undefined): FanSource {
  if (src && (sources as string[]).includes(src)) return src as FanSource;
  return "QR code";
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  optional,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {optional ? <span className="ml-1 text-subtle">optional</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete="on"
      />
    </div>
  );
}
