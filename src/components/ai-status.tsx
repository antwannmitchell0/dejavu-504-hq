import { LoaderCircle } from "lucide-react";

export function Thinking({ label = "My Team is writing" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <LoaderCircle className="size-4 animate-spin" />
      <span className="shimmer">{label}</span>
    </div>
  );
}
