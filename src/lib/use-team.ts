import { useState } from "react";
import { askTeam, type TeamMode } from "@/lib/ai";
import { buildAiContext } from "@/lib/context";
import { useHQ } from "@/lib/store";

export function useTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(mode: TeamMode, prompt: string) {
    setLoading(true);
    setError("");
    try {
      const context = buildAiContext(useHQ.getState());
      const res = await askTeam({ data: { mode, prompt, context } });
      if (!res.ok) {
        setError(res.error);
        return null;
      }
      return res.text;
    } catch {
      setError("My Team could not reach you. Try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { ask, loading, error };
}
