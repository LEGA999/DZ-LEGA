export interface ServerInfo {
  name: string;
  ip: string;
  port: number;
}

export interface SettingsState {
  language: string;
  fpsCap: number;
  quality: string;
  volume: number;
  notifications: boolean;
  autoConnect: boolean;
}

export interface UserProfile {
  id: string; // e.g., "#1249"
  name: string;
  avatar: string; // url or preset identifier
  bio: string;
  status: "online" | "away" | "in_game";
  statusText: string;
  isAdmin?: boolean;
  isMuted?: boolean;
  isBanned?: boolean;
  timeoutUntil?: string | null; // Date string when timeout ends
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userTag: string; // e.g., #1249
  content: string;
  timestamp: string;
  likes: number;
  likedByMe?: boolean;
}

export interface TicketMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderTag: string;
  content: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userTag: string;
  title: string;
  description: string;
  status: "open" | "closed";
  createdAt: string;
  messages: TicketMessage[];
}

export interface AdminChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderTag: string;
  content: string;
  timestamp: string;
}
