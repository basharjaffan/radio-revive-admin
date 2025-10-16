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

async function syncGroupCounts() {
  console.log('🔄 Syncing group device counts...\n');
  
  const devicesRef = collection(db, 'config', 'devices', 'list');
  const groupsRef = collection(db, 'config', 'groups', 'list');
  
  const devicesSnap = await getDocs(devicesRef);
  const groupsSnap = await getDocs(groupsRef);
  
  // Count devices per group
  const groupCounts = new Map<string, number>();
  
  devicesSnap.docs.forEach(device => {
    const groupId = device.data().groupId || device.data().group;
    if (groupId) {
      groupCounts.set(groupId, (groupCounts.get(groupId) || 0) + 1);
    }
  });
  
  // Update group counts
  for (const group of groupsSnap.docs) {
    const count = groupCounts.get(group.id) || 0;
    await updateDoc(doc(db, 'config', 'groups', 'list', group.id), {
      deviceCount: count,
    });
    console.log(`✅ ${group.data().name}: ${count} device(s)`);
  }
  
  console.log('\n✅ All group counts synced!');
}

syncGroupCounts().then(() => process.exit(0));
