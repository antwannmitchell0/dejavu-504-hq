import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Screen } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHQ } from "@/lib/store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const artist = useHQ((s) => s.artist);
  const updateArtist = useHQ((s) => s.updateArtist);
  const resetDemo = useHQ((s) => s.resetDemo);

  return (
    <AppShell>
      <Screen>
        <PageHeader kicker="Housekeeping" title="Settings" />
        <div className="space-y-4 px-5">
          <Field label="Artist name" value={artist.name} onSave={(v) => updateArtist({ name: v })} />
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea
              defaultValue={artist.bio}
              onBlur={(e) => updateArtist({ bio: e.target.value })}
            />
          </div>
          <Field label="Booking email" value={artist.bookingEmail} onSave={(v) => updateArtist({ bookingEmail: v })} />
          <Field label="Press email" value={artist.pressEmail} onSave={(v) => updateArtist({ pressEmail: v })} />

          <div className="rounded-xl bg-surface p-4 shadow-card">
            <p className="text-sm font-medium">This is a working prototype</p>
            <p className="mt-1 text-sm text-muted">
              Built so each artist can eventually have their own account, fans, QR code, campaigns, and advisor.
              Right now it's Deja Vu 504's HQ, running on this device.
            </p>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              resetDemo();
              toast.success("Demo data restored");
            }}
          >
            Reset demo data
          </Button>
        </div>
      </Screen>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={value} onBlur={(e) => onSave(e.target.value)} />
    </div>
  );
}
