import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function assignDeviceToGroup() {
  console.log('🔗 Assigning device to group...\n');
  
  // Get device
  const devicesRef = collection(db, 'config', 'devices', 'list');
  const devicesSnap = await getDocs(devicesRef);
  const device = devicesSnap.docs[0];
  
  // Get group
  const groupsRef = collection(db, 'config', 'groups', 'list');
  const groupsSnap = await getDocs(groupsRef);
  const group = groupsSnap.docs.find(g => g.data().name === 'Butik Musik');
  
  if (!device || !group) {
    console.error('Device or group not found!');
    return;
  }
  
  console.log(`📱 Device: ${device.data().name} (${device.id})`);
  console.log(`📂 Group: ${group.data().name} (${group.id})`);
  console.log(`🎵 Stream URL: ${group.data().streamUrl}\n`);
  
  // Assign device to group
  await updateDoc(doc(db, 'config', 'devices', 'list', device.id), {
    groupId: group.id,
    group: group.id, // Legacy field
    streamUrl: group.data().streamUrl,
  });
  
  console.log('✅ Device assigned to group!');
}

assignDeviceToGroup().then(() => process.exit(0));
