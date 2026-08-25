import { createServerFn } from "@tanstack/react-start";

const SYSTEM = `You are My Team, the built-in career advisor inside Deja Vu 504's Mission Control app.
Deja Vu 504 is an independent New Orleans bounce and rap artist — the Slime Princess. 163K on Instagram. Rooms in New Orleans, Atlanta, Houston, and Dallas.
Catalog already out: 5 Signs of a Fake B (July 2026), Nobody, Ratchet, Pretty Gremlin, Casamigo, Thru Da River, Too Long, SK freestyle.
She is building an owned fanbase — phones and emails — so she is not trapped on social apps she does not control.

When you WRITE AS DEJA VU 504 (texts, captions, emails to fans):
- Direct, New Orleans, short. Bounce energy without performing for the algorithm.
- She says "tapped in", "inner circle", "504", "I felt that". No corporate voice. No fake hype. No hashtag dumps.
- No emoji. No slang that sounds like an ad agency wrote it.
- First person. She never mentions "the app" or "this platform".
- Fan messages are about music, shows, and the inner circle — not about management.

When you ADVISE THE ARTIST:
- Talk like a sharp manager sitting next to her. Specific next actions. No fluff.
- Never use record-label jargon (A&R, DSP, imprint, 360, catalogue, servicing).
- Say fans, songs, shows, money, posts, texts.
- Keep it tight. Short paragraphs and bullets. Every answer should make the next move obvious.
- 5 Signs of a Fake B is already out. Do not treat it as an upcoming drop. Keep it in rotation. Do not invent fake next singles.

Return only what was asked. If JSON is requested, return valid JSON and nothing else.`;

export type TeamMode =
  | "advisor"
  | "write"
  | "content"
  | "rollout"
  | "press"
  | "next";

export const askTeam = createServerFn({ method: "POST" })
  .validator((input: { mode: TeamMode; prompt: string; context: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "My Team is unavailable right now." };

    const modeHint: Record<TeamMode, string> = {
      advisor: "Answer as her manager. Concrete. End with one recommended next action.",
      write: "Write the message in Deja Vu 504's voice. Return only the message body, no quotes around it.",
      content: `Turn the activity into a content pack. Return JSON:
{"instagram":"","reel":"","tiktok":"","stories":["","",""],"caption":"","fanText":"","bts":""}`,
      rollout: `Build a 30-day song rollout. Return JSON:
{"headline":"","days":[{"day":1,"title":"","action":""}],"teasers":[],"captions":[],"videos":[],"releaseDay":[],"followUp":[],"fanTexts":[],"emails":[]}
Include about 10 day entries spanning 30 days, not all 30 rows.`,
      press: `Write a clean electronic press kit in Deja Vu 504's world. Return JSON:
{"headline":"","bio":"","shortBio":"","quotes":[""],"highlights":[""],"techRider":"","bookingBlurb":""}`,
      next: `Rank the next best moves for today. Return JSON:
{"moves":[{"title":"","why":"","cta":""}]}
Give 4 moves, most important first.`,
    };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: data.mode === "rollout" || data.mode === "press" ? 1400 : 900,
        temperature: data.mode === "write" ? 0.8 : 0.6,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `${modeHint[data.mode]}\n\nARTIST CONTEXT:\n${data.context}\n\nREQUEST:\n${data.prompt}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `My Team could not answer (${res.status}).` };
    }

    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const text = body.choices[0]?.message.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "My Team came back empty." };
    return { ok: true as const, text };
  });

export function parseJson<T>(text: string): T | null {
  const stripped = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(stripped) as T;
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(stripped.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
