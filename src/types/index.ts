export interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'playing' | 'paused';
  lastSeen: any;
  deviceId: string;
  groupId?: string;
  streamUrl?: string;
  uptime?: number;
  firmwareVersion?: string;
  wifiConnected?: boolean;
  ethernetConnected?: boolean;
  volume?: number;
  
  // System metrics
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  diskTotal?: string;
  diskUsed?: string;
}

export interface Group {
  id: string;
  name: string;
  streamUrl?: string;
  musicFiles?: string[];
  deviceCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  deviceId?: string;
  createdAt?: any;
}

export interface MusicFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}
