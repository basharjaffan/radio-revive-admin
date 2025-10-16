import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listDevices() {
  const devicesRef = collection(db, 'config', 'devices', 'list');
  const snapshot = await getDocs(devicesRef);
  
  console.log('\n📱 All Devices:\n');
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Firestore ID: ${doc.id}`);
    console.log(`  deviceId: ${data.deviceId || 'N/A'}`);
    console.log(`  name: ${data.name}`);
    console.log(`  IP: ${data.ipAddress}`);
    console.log(`  status: ${data.status}`);
    console.log(`  lastSeen: ${data.lastSeen?.toDate?.().toISOString() || 'N/A'}`);
    console.log('');
  });
}

listDevices().then(() => process.exit(0));
