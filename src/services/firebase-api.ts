import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Device, Group, User } from '@/types';

// Devices API
export const devicesApi = {
  subscribe: (callback: (devices: Device[]) => void) => {
    const devicesRef = collection(db, 'config', 'devices', 'list');
    
    return onSnapshot(devicesRef, (snapshot) => {
      const devices: Device[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Device',
          status: data.status || 'offline',
          ipAddress: data.ipAddress,
          lastSeen: data.lastSeen?.toDate?.()?.toISOString() || new Date().toISOString(),
          groupId: data.group,
          streamUrl: data.streamUrl,
          currentUrl: data.currentUrl,
          volume: data.volume,
          uptime: data.uptime,
          firmwareVersion: data.firmwareVersion,
          wifiConfigured: data.wifiConfigured || false,
        };
      });
      
      callback(devices);
    });
  },

  update: async (deviceId: string, data: Partial<Device>) => {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    await updateDoc(deviceRef, data as any);
  },

  delete: async (deviceId: string) => {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    await deleteDoc(deviceRef);
  },
};

// Groups API
export const groupsApi = {
  subscribe: (callback: (groups: Group[]) => void) => {
    const groupsRef = collection(db, 'config', 'groups', 'list');
    
    return onSnapshot(groupsRef, (snapshot) => {
      const groups: Group[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Group',
          streamUrl: data.streamUrl || '',
          deviceCount: data.deviceCount || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });
      
      callback(groups);
    });
  },

  create: async (name: string, streamUrl: string) => {
    const groupsRef = collection(db, 'config', 'groups', 'list');
    const docRef = await addDoc(groupsRef, {
      name,
      streamUrl,
      deviceCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (groupId: string, data: Partial<Group>) => {
    const groupRef = doc(db, 'config', 'groups', 'list', groupId);
    await updateDoc(groupRef, data as any);
  },

  delete: async (groupId: string) => {
    const groupRef = doc(db, 'config', 'groups', 'list', groupId);
    await deleteDoc(groupRef);
  },
};

// Users API
export const usersApi = {
  subscribe: (callback: (users: User[]) => void) => {
    const usersRef = collection(db, 'users');
    
    return onSnapshot(usersRef, (snapshot) => {
      const users: User[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || '',
          name: data.name || 'Unnamed User',
          role: data.role || 'user',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });
      
      callback(users);
    });
  },

  create: async (email: string, name: string, role: 'admin' | 'user') => {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, {
      email,
      name,
      role,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (userId: string, data: Partial<User>) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data as any);
  },

  delete: async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  },
};

// Commands API
export const commandsApi = {
  send: async (deviceId: string, action: 'play' | 'pause' | 'stop', url?: string) => {
    const commandsRef = collection(db, 'config', 'devices', 'list', deviceId, 'commands');
    const commandData: any = {
      action,
      timestamp: serverTimestamp(),
      processed: false,
    };
    
    if (url) {
      commandData.url = url;
    }
    
    await addDoc(commandsRef, commandData);
  },

  sendVolume: async (deviceId: string, volume: number) => {
    const commandsRef = collection(db, 'config', 'devices', 'list', deviceId, 'commands');
    await addDoc(commandsRef, {
      action: 'volume',
      volume,
      timestamp: serverTimestamp(),
      processed: false,
    });
  },

  sendSystemUpdate: async (deviceId: string) => {
    const commandsRef = collection(db, 'config', 'devices', 'list', deviceId, 'commands');
    await addDoc(commandsRef, {
      action: 'system_update',
      timestamp: serverTimestamp(),
      processed: false,
    });
  },

  sendWifiConfig: async (deviceId: string, ssid: string, password: string) => {
    const commandsRef = collection(db, 'config', 'devices', 'list', deviceId, 'commands');
    await addDoc(commandsRef, {
      action: 'wifi_config',
      ssid,
      password,
      timestamp: serverTimestamp(),
      processed: false,
    });
  },
};

// Settings API
export const settingsApi = {
  subscribe: (callback: (settings: any) => void) => {
    const settingsRef = doc(db, 'config', 'settings');
    
    return onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        callback(null);
      }
    });
  },

  get: async () => {
    const settingsRef = doc(db, 'config', 'settings');
    const snapshot = await getDoc(settingsRef);
    return snapshot.exists() ? snapshot.data() : null;
  },

  update: async (data: any) => {
    const settingsRef = doc(db, 'config', 'settings');
    await setDoc(settingsRef, data, { merge: true });
  },
};

  async sendNetworkConfig(
    deviceId: string,
    ipAddress: string,
    gateway: string,
    dns1: string,
    dns2?: string,
    interfaceName: string = 'eth0'
  ): Promise<void> {
    await addDoc(collection(db, 'config', 'commands', 'list'), {
      deviceId,
      action: 'network_config',
      ipAddress,
      gateway,
      dns1,
      dns2: dns2 || '',
      interface: interfaceName,
      processed: false,
      createdAt: serverTimestamp(),
    });
  }

  async sendNetworkConfig(
    deviceId: string,
    ipAddress: string,
    gateway: string,
    dns1: string,
    dns2?: string,
    interfaceName: string = 'eth0'
  ): Promise<void> {
    await addDoc(collection(db, 'config', 'commands', 'list'), {
      deviceId,
      action: 'network_config',
      ipAddress,
      gateway,
      dns1,
      dns2: dns2 || '',
      interface: interfaceName,
      processed: false,
      createdAt: serverTimestamp(),
    });
  }
