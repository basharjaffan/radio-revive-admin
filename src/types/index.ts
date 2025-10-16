export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'playing' | 'paused' | 'unconfigured';
  state?: 'playing' | 'paused' | 'stopped';
  userId: string;
  groupId?: string;
  lastSeen: string;
  ipAddress?: string;
  currentUrl?: string;
  streamUrl?: string;
  firmwareVersion?: string;
  uptime?: number;
  volume?: number;
  wifiConfigured?: boolean;
}

export interface Group {
  id: string;
  name: string;
  deviceCount?: number;
  streamUrl?: string;
}

export interface Command {
  action: 'play' | 'pause' | 'stop' | 'restart';
  url?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
export * from './user';
