import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  deleteField
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Device, Group, User } from '@/types';

// Devices API
export const devicesApi = {
  subscribe: (callback: (devices: Device[]) => void) => {
    const devicesRef = collection(db, 'config', 'devices', 'list');
    const q = query(devicesRef, orderBy('lastSeen', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const devices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Device[];
      callback(devices);
    });
  },

  update: async (deviceId: string, data: Partial<Device>) => {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    await updateDoc(deviceRef, data);
  },

  delete: async (deviceId: string) => {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    await deleteDoc(deviceRef);
  }
};

// Groups API
export const groupsApi = {
  subscribe: (callback: (groups: Group[]) => void) => {
    const groupsRef = collection(db, 'config', 'groups', 'list');
    const q = query(groupsRef, orderBy('name', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      callback(groups);
    });
  },

  create: async (data: Omit<Group, 'id'>) => {
    const groupsRef = collection(db, 'config', 'groups', 'list');
    await addDoc(groupsRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  update: async (groupId: string, data: Partial<Group>) => {
    const groupRef = doc(db, 'config', 'groups', 'list', groupId);
    await updateDoc(groupRef, data);
  },

  delete: async (groupId: string) => {
    const groupRef = doc(db, 'config', 'groups', 'list', groupId);
    await deleteDoc(groupRef);
  }
};

// Users API - Läser från BÅDA platserna
export const usersApi = {
  subscribe: (callback: (users: User[]) => void) => {
    const configUsersRef = collection(db, 'config', 'users', 'list');
    
    const unsubConfig = onSnapshot(configUsersRef, async (configSnapshot) => {
      const configUsers = configSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      try {
        const oldUsersRef = collection(db, 'users');
        const oldSnapshot = await getDocs(oldUsersRef);
        const oldUsers = oldSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];

        const allUsers = [...configUsers, ...oldUsers];
        callback(allUsers);
      } catch (error) {
        callback(configUsers);
      }
    });

    return unsubConfig;
  },

  create: async (data: Omit<User, 'id'>) => {
    const usersRef = collection(db, 'config', 'users', 'list');
    
    // Remove undefined values
    const cleanData: any = {
      name: data.name,
      email: data.email,
      createdAt: serverTimestamp()
    };
    
    if (data.deviceId) {
      cleanData.deviceId = data.deviceId;
    }
    
    await addDoc(usersRef, cleanData);
  },

  update: async (userId: string, data: Partial<User>) => {
    // Clean data - remove undefined, replace with deleteField
    const cleanData: any = {};
    
    if (data.name !== undefined) {
      cleanData.name = data.name;
    }
    
    if (data.email !== undefined) {
      cleanData.email = data.email;
    }
    
    // Handle deviceId specially
    if (data.deviceId === undefined || data.deviceId === null || data.deviceId === '') {
      cleanData.deviceId = deleteField();
    } else {
      cleanData.deviceId = data.deviceId;
    }
    
    // Try updating in both locations
    try {
      const configUserRef = doc(db, 'config', 'users', 'list', userId);
      await updateDoc(configUserRef, cleanData);
    } catch (error) {
      // If not in config, try old location
      const oldUserRef = doc(db, 'users', userId);
      await updateDoc(oldUserRef, cleanData);
    }
  },

  delete: async (userId: string) => {
    try {
      const configUserRef = doc(db, 'config', 'users', 'list', userId);
      await deleteDoc(configUserRef);
    } catch (error) {
      console.error('Could not delete from config/users/list');
    }
    
    try {
      const oldUserRef = doc(db, 'users', userId);
      await deleteDoc(oldUserRef);
    } catch (error) {
      console.error('Could not delete from users');
    }
  }
};

// Commands API
export const commandsApi = {
  send: async (deviceId: string, action: string, streamUrl?: string, volume?: number) => {
    const commandsRef = collection(db, 'config', 'commands', 'list');
    await addDoc(commandsRef, {
      deviceId,
      action,
      streamUrl: streamUrl || null,
      volume: volume || null,
      processed: false,
      createdAt: serverTimestamp()
    });
  },

  sendSystemUpdate: async (deviceId: string) => {
    const commandsRef = collection(db, 'config', 'commands', 'list');
    await addDoc(commandsRef, {
      deviceId,
      action: 'system_update',
      processed: false,
      createdAt: serverTimestamp()
    });
  },

  sendWifiConfig: async (deviceId: string, ssid: string, password: string) => {
    const commandsRef = collection(db, 'config', 'commands', 'list');
    await addDoc(commandsRef, {
      deviceId,
      action: 'configure_wifi',
      ssid,
      password,
      processed: false,
      createdAt: serverTimestamp()
    });
  },

  sendNetworkConfig: async (
    deviceId: string,
    ipAddress: string,
    gateway: string,
    dns1: string,
    dns2?: string,
    interfaceName: string = 'eth0'
  ) => {
    const commandsRef = collection(db, 'config', 'commands', 'list');
    await addDoc(commandsRef, {
      deviceId,
      action: 'network_config',
      ipAddress,
      gateway,
      dns1,
      dns2: dns2 || '',
      interface: interfaceName,
      processed: false,
      createdAt: serverTimestamp()
    });
  }
};
