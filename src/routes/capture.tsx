import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/chrome";
import { QrBlock, useJoinUrl } from "@/components/qr-block";
import { Button } from "@/components/ui/button";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/capture")({ component: CapturePage });

function CapturePage() {
  const url = useJoinUrl();
  const metrics = useHQ((s) => s.metrics);
  const showMode = useHQ((s) => s.showMode);

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success("Fan page link copied");
  }

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Owned audience" title="Capture a Fan" back="/" />
        <div className="px-5">
          <p className="text-sm leading-relaxed text-muted">
            Stop collecting followers you can't text. Point this at someone. They join the inner circle.
          </p>

          <div className="mt-6 flex flex-col items-center rounded-2xl bg-surface px-5 py-7 shadow-card">
            <QrBlock size={210} />
            <p className="mt-4 font-display text-3xl italic">Deja Vu 504</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Inner circle</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button type="button" variant="secondary" onClick={copy}>
              Copy link
            </Button>
            <Button asChild variant="secondary">
              <Link to="/join" search={{ src: undefined }}>Preview page</Link>
            </Button>
          </div>

          <Button asChild size="xl" className="mt-3 w-full">
            <Link to="/show-mode" search={{ show: undefined }}>Open Show Mode</Link>
          </Button>

          {showMode.active ? (
            <p className="mt-3 text-center text-xs text-success">
              Show Mode is live · {showMode.capturedFanIds.length} captured tonight
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-subtle">
              {metrics.totalFans.toLocaleString()} fans owned
            </p>
          )}
        </div>
      </Screen>
    </AppShell>
  );
}
