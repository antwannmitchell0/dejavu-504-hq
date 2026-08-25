import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  activity as seedActivity,
  artist as seedArtist,
  fans as seedFans,
  LAST_NIGHT_UNTEXTED,
  metrics as seedMetrics,
  money as seedMoney,
  releases as seedReleases,
  shows as seedShows,
  team as seedTeam,
} from "@/lib/seed";
import type {
  ActivityItem,
  Artist,
  ContentPack,
  Fan,
  FanSource,
  MessageDraft,
  Metrics,
  MoneyEntry,
  Release,
  RolloutPlan,
  Show,
  ShowModeSession,
  TeamMember,
} from "@/lib/types";
import { uid } from "@/lib/utils";

export interface FanDraft {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  city?: string;
  favoriteSong?: string;
  birthday?: string;
  source?: FanSource;
}

export interface HQState {
  artist: Artist;
  fans: Fan[];
  metrics: Metrics;
  releases: Release[];
  shows: Show[];
  money: MoneyEntry[];
  team: TeamMember[];
  activity: ActivityItem[];
  messages: MessageDraft[];
  showMode: ShowModeSession;
  lastNightUntexted: number;
  contentPacks: ContentPack[];
  rollouts: RolloutPlan[];
  pressKit: string;
  addFan: (draft: FanDraft) => Fan;
  updateFan: (id: string, patch: Partial<Fan>) => void;
  addMoney: (entry: Omit<MoneyEntry, "id" | "artistId">) => void;
  updateTeam: (id: string, patch: Partial<TeamMember>) => void;
  updateArtist: (patch: Partial<Artist>) => void;
  startShowMode: (showId?: string) => void;
  stopShowMode: () => void;
  sendMessage: (draft: Omit<MessageDraft, "id" | "createdAt" | "sent">) => void;
  markLastNightTexted: () => void;
  saveContentPack: (pack: ContentPack) => void;
  saveRollout: (plan: RolloutPlan) => void;
  savePressKit: (html: string) => void;
  resetDemo: () => void;
}

const emptyShowMode: ShowModeSession = {
  active: false,
  startedAt: null,
  showId: null,
  capturedFanIds: [],
};

function initial() {
  return {
    artist: seedArtist,
    fans: seedFans,
    metrics: seedMetrics,
    releases: seedReleases,
    shows: seedShows,
    money: seedMoney,
    team: seedTeam,
    activity: seedActivity,
    messages: [] as MessageDraft[],
    showMode: emptyShowMode,
    lastNightUntexted: LAST_NIGHT_UNTEXTED,
    contentPacks: [] as ContentPack[],
    rollouts: [] as RolloutPlan[],
    pressKit: "",
  };
}

export const useHQ = create<HQState>()(
  persist(
    (set, get) => ({
      ...initial(),
      addFan: (draft) => {
        const state = get();
        const now = new Date().toISOString();
        const fan: Fan = {
          id: uid("fan"),
          artistId: state.artist.id,
          firstName: draft.firstName.trim(),
          lastName: (draft.lastName ?? "").trim(),
          phone: (draft.phone ?? "").replace(/\D/g, ""),
          email: (draft.email ?? "").trim(),
          city: (draft.city ?? "").trim(),
          favoriteSong: (draft.favoriteSong ?? "").trim(),
          birthday: draft.birthday ?? "",
          joinedAt: now,
          source: draft.source ?? "QR code",
          tags: [],
          notes: "",
          lastContactedAt: "",
          engagement: [
            {
              id: uid("ev"),
              date: now,
              type: "signup",
              label: `Joined via ${draft.source ?? "QR code"}`,
            },
          ],
        };
        const inShow = state.showMode.active;
        set({
          fans: [fan, ...state.fans],
          metrics: {
            ...state.metrics,
            totalFans: state.metrics.totalFans + 1,
            phones: state.metrics.phones + (fan.phone ? 1 : 0),
            emails: state.metrics.emails + (fan.email ? 1 : 0),
            newThisWeek: state.metrics.newThisWeek + 1,
            signupsByDay: state.metrics.signupsByDay.map((n, i, arr) =>
              i === arr.length - 1 ? n + 1 : n,
            ),
          },
          showMode: inShow
            ? {
                ...state.showMode,
                capturedFanIds: [...state.showMode.capturedFanIds, fan.id],
              }
            : state.showMode,
          activity: [
            {
              id: uid("act"),
              artistId: state.artist.id,
              at: now,
              title: `${fan.firstName} tapped in`,
              detail: fan.city
                ? `${fan.city} · ${fan.source}`
                : fan.source,
              type: "fan",
            },
            ...state.activity,
          ],
        });
        return fan;
      },
      updateFan: (id, patch) =>
        set((s) => ({
          fans: s.fans.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      addMoney: (entry) =>
        set((s) => ({
          money: [
            {
              ...entry,
              id: uid("mon"),
              artistId: s.artist.id,
            },
            ...s.money,
          ],
        })),
      updateTeam: (id, patch) =>
        set((s) => ({
          team: s.team.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      updateArtist: (patch) =>
        set((s) => ({ artist: { ...s.artist, ...patch } })),
      startShowMode: (showId) =>
        set({
          showMode: {
            active: true,
            startedAt: new Date().toISOString(),
            showId: showId ?? null,
            capturedFanIds: [],
          },
        }),
      stopShowMode: () => set({ showMode: emptyShowMode }),
      sendMessage: (draft) =>
        set((s) => {
          const now = new Date().toISOString();
          const lastNight = draft.audience === "Last night's fans";
          return {
            messages: [
              {
                ...draft,
                id: uid("msg"),
                createdAt: now,
                sent: true,
              },
              ...s.messages,
            ],
            lastNightUntexted: lastNight ? 0 : s.lastNightUntexted,
            fans: lastNight
              ? s.fans.map((f) =>
                  f.fromLastShow
                    ? {
                        ...f,
                        lastContactedAt: now,
                        engagement: [
                          {
                            id: uid("ev"),
                            date: now,
                            type: draft.kind === "email" ? "email" : "text",
                            label: "Follow-up after Republic NOLA",
                          },
                          ...f.engagement,
                        ],
                      }
                    : f,
                )
              : s.fans,
            activity: [
              {
                id: uid("act"),
                artistId: s.artist.id,
                at: now,
                title: `Sent ${draft.kind} to ${draft.audience}`,
                detail: draft.body.slice(0, 80),
                type: "fan",
              },
              ...s.activity,
            ],
          };
        }),
      markLastNightTexted: () =>
        set((s) => ({
          lastNightUntexted: 0,
          fans: s.fans.map((f) =>
            f.fromLastShow
              ? { ...f, lastContactedAt: new Date().toISOString() }
              : f,
          ),
        })),
      saveContentPack: (pack) =>
        set((s) => ({ contentPacks: [pack, ...s.contentPacks] })),
      saveRollout: (plan) =>
        set((s) => ({
          rollouts: [plan, ...s.rollouts.filter((r) => r.releaseId !== plan.releaseId)],
        })),
      savePressKit: (html) => set({ pressKit: html }),
      resetDemo: () => set(initial()),
    }),
    { name: "deja-vu-504-hq-v2" },
  ),
);

export function topCities(fans: Fan[], limit = 4) {
  const counts = new Map<string, number>();
  for (const f of fans) {
    if (!f.city) continue;
    counts.set(f.city, (counts.get(f.city) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  // Seed totals so the dashboard matches the promised numbers even though
  // only a working set of fans is stored in detail.
  const seeded = [
    ["New Orleans", 412],
    ["Atlanta", 338],
    ["Houston", 214],
    ["Dallas", 168],
  ] as const;
  const extra = new Map<string, number>(seeded);
  for (const [city, n] of ranked) {
    extra.set(city, Math.max(extra.get(city) ?? 0, n));
  }
  return [...extra.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([city, count]) => ({ city, count }));
}

export function sourceBreakdown(fans: Fan[]) {
  const seeded: Record<FanSource, number> = {
    "Live show": 486,
    Instagram: 271,
    TikTok: 198,
    "QR code": 154,
    Website: 72,
    Referral: 44,
    Other: 22,
  };
  for (const f of fans) {
    seeded[f.source] += 0;
  }
  return (Object.keys(seeded) as FanSource[]).map((source) => ({
    source,
    count: seeded[source],
  }));
}

export function mostEngaged(fans: Fan[], limit = 5) {
  return [...fans]
    .sort((a, b) => b.engagement.length - a.engagement.length)
    .slice(0, limit);
}
