import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect } from "react";
import { QrBlock } from "@/components/qr-block";
import { Button } from "@/components/ui/button";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/show-mode")({
  validateSearch: (s: Record<string, unknown>) => ({
    show: typeof s.show === "string" ? s.show : undefined,
  }),
  component: ShowModePage,
});

function ShowModePage() {
  const { show } = Route.useSearch();
  const navigate = useNavigate();
  const addFan = useHQ((s) => s.addFan);
  const startShowMode = useHQ((s) => s.startShowMode);
  const stopShowMode = useHQ((s) => s.stopShowMode);
  const showMode = useHQ((s) => s.showMode);
  const fans = useHQ((s) => s.fans);
  const shows = useHQ((s) => s.shows);
  const artist = useHQ((s) => s.artist);

  useEffect(() => {
    if (!useHQ.getState().showMode.active) {
      startShowMode(show);
    }
  }, [show, startShowMode]);

  const captured = fans.filter((f) => showMode.capturedFanIds.includes(f.id));
  const phones = captured.filter((f) => f.phone).length;
  const emails = captured.filter((f) => f.email).length;
  const liveShow = shows.find((s) => s.id === (showMode.showId ?? show));

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg text-fg">
      <button
        type="button"
        onClick={() => {
          stopShowMode();
          navigate({ to: "/shows" });
        }}
        className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-elevated text-fg"
        aria-label="Close Show Mode"
      >
        <X className="size-5" />
      </button>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Scan to tap in</p>
        <h1 className="mt-1 font-display text-5xl italic leading-none">{artist.name}</h1>
        {liveShow ? (
          <p className="mt-2 text-sm text-muted">
            {liveShow.venue} · {liveShow.city}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Tonight</p>
        )}
        <div className="mt-6">
          <QrBlock size={260} />
        </div>
        <p className="mt-4 max-w-[16rem] text-center text-sm text-subtle">
          Join the inner circle. New music and shows land here first.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <Stat label="Fans captured tonight" value={String(captured.length)} />
        <Stat label="New numbers" value={String(phones)} />
        <Stat label="New emails" value={String(emails)} />
        <Stat
          label="Top fan source"
          value={
            captured.length
              ? [...captured.reduce((m, f) => {
                  m.set(f.source, (m.get(f.source) ?? 0) + 1);
                  return m;
                }, new Map<string, number>())].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "QR code"
              : "—"
          }
        />
        <Button
          type="button"
          variant="secondary"
          className="col-span-2"
          onClick={() => {
            const names = ["Zion", "Aria", "Noah", "Lila", "Cam", "Piper"];
            const cities = ["New Orleans", "Atlanta", "Houston", "Dallas"];
            const first = names[captured.length % names.length];
            addFan({
              firstName: first,
              city: cities[captured.length % cities.length],
              phone: `50455501${(20 + captured.length).toString().padStart(2, "0")}`,
              source: "QR code",
            });
          }}
        >
          Someone just scanned
        </Button>
        <Button
          type="button"
          className="col-span-2"
          onClick={() => {
            stopShowMode();
            navigate({ to: "/shows" });
          }}
        >
          End Show Mode
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3 shadow-card">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none">{value}</p>
    </div>
  );
}
