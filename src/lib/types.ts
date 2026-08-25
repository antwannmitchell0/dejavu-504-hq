export type FanSource =
  | "Live show"
  | "Instagram"
  | "TikTok"
  | "QR code"
  | "Website"
  | "Referral"
  | "Other";

export type EngagementType =
  | "signup"
  | "text"
  | "email"
  | "show"
  | "merch"
  | "stream"
  | "click"
  | "note";

export interface EngagementEvent {
  id: string;
  date: string;
  type: EngagementType;
  label: string;
}

export interface Fan {
  id: string;
  artistId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  favoriteSong: string;
  birthday: string;
  joinedAt: string;
  source: FanSource;
  tags: string[];
  notes: string;
  engagement: EngagementEvent[];
  lastContactedAt: string;
  fromLastShow?: boolean;
}

export interface Release {
  id: string;
  artistId: string;
  title: string;
  status: "released" | "upcoming";
  releaseDate: string;
  cover: string;
  spotify: string;
  apple: string;
  youtube: string;
  streams: number;
  saves: number;
  playlistAdds: number;
}

export interface Show {
  id: string;
  artistId: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  expectedAttendance: number;
  actualAttendance: number;
  status: "upcoming" | "past";
  fansCaptured: number;
  notes: string;
}

export interface MoneyEntry {
  id: string;
  artistId: string;
  kind: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note: string;
}

export interface TeamMember {
  id: string;
  artistId: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
  followUp: string;
}

export interface ActivityItem {
  id: string;
  artistId: string;
  at: string;
  title: string;
  detail: string;
  type: "fan" | "music" | "show" | "money" | "team" | "content";
}

export interface MessageDraft {
  id: string;
  kind: "text" | "email" | "announcement" | "invite" | "song" | "exclusive";
  audience: string;
  subject: string;
  body: string;
  createdAt: string;
  sent: boolean;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  bio: string;
  shortBio: string;
  hometown: string;
  basedIn: string;
  genre: string;
  photo: string;
  avatar: string;
  photos: string[];
  bookingEmail: string;
  bookingPhone: string;
  pressEmail: string;
  welcomeText: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  spotify: string;
  apple: string;
  youtube: string;
  website: string;
}

export interface Metrics {
  totalFans: number;
  phones: number;
  emails: number;
  newThisWeek: number;
  signupsByDay: number[];
}

export interface ShowModeSession {
  active: boolean;
  startedAt: string | null;
  showId: string | null;
  capturedFanIds: string[];
}

export interface ContentPack {
  activity: string;
  instagram: string;
  reel: string;
  tiktok: string;
  stories: string[];
  caption: string;
  fanText: string;
  bts: string;
  createdAt: string;
}

export interface RolloutPlan {
  releaseId: string;
  headline: string;
  days: { day: number; title: string; action: string }[];
  teasers: string[];
  captions: string[];
  videos: string[];
  releaseDay: string[];
  followUp: string[];
  fanTexts: string[];
  emails: string[];
  createdAt: string;
}

export interface NextMove {
  title: string;
  why: string;
  cta: string;
  href: string;
}

export type MessageKind = MessageDraft["kind"];
