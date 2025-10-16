import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicateDevices() {
  console.log('🔍 Scanning for duplicate devices...');
  
  try {
    const devicesRef = collection(db, 'config', 'devices', 'list');
    const snapshot = await getDocs(devicesRef);
    
    console.log(`📊 Found ${snapshot.docs.length} total devices\n`);
    
    // Group by both deviceId AND IP address
    const devicesByDeviceId = new Map<string, any[]>();
    const devicesByIP = new Map<string, any[]>();
    
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const deviceId = data.deviceId || docSnap.id;
      const ipAddress = data.ipAddress;
      
      const deviceInfo = {
        firestoreId: docSnap.id,
        deviceId: deviceId,
        ipAddress: ipAddress || 'N/A',
        lastSeen: data.lastSeen?.toDate?.() || new Date(0),
        name: data.name || 'Unnamed',
        status: data.status || 'unknown',
      };
      
      // Group by deviceId
      if (!devicesByDeviceId.has(deviceId)) {
        devicesByDeviceId.set(deviceId, []);
      }
      devicesByDeviceId.get(deviceId)!.push(deviceInfo);
      
      // Group by IP (only if IP exists and is not N/A)
      if (ipAddress && ipAddress !== 'N/A' && ipAddress !== 'unknown') {
        if (!devicesByIP.has(ipAddress)) {
          devicesByIP.set(ipAddress, []);
        }
        devicesByIP.get(ipAddress)!.push(deviceInfo);
      }
    });
    
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;
    const toDelete = new Set<string>();
    
    // Check for duplicates by deviceId
    console.log('🔍 Checking for duplicates by deviceId...');
    for (const [deviceId, devices] of devicesByDeviceId.entries()) {
      if (devices.length > 1) {
        duplicatesFound++;
        console.log(`\n📦 Found ${devices.length} devices with deviceId: ${deviceId}`);
        
        devices.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
        console.log(`   ✅ Keeping: ${devices[0].name} (${devices[0].firestoreId})`);
        
        for (let i = 1; i < devices.length; i++) {
          console.log(`   ❌ Will delete: ${devices[i].name} (${devices[i].firestoreId})`);
          toDelete.add(devices[i].firestoreId);
        }
      }
    }
    
    // Check for duplicates by IP address (same physical device, different MAC)
    console.log('\n🔍 Checking for duplicates by IP address...');
    for (const [ip, devices] of devicesByIP.entries()) {
      if (devices.length > 1) {
        duplicatesFound++;
        console.log(`\n🌐 Found ${devices.length} devices with IP: ${ip}`);
        
        devices.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
        
        console.log(`   ✅ Keeping: ${devices[0].name} (ID: ${devices[0].deviceId})`);
        console.log(`      Firestore ID: ${devices[0].firestoreId}`);
        console.log(`      Status: ${devices[0].status}, Last: ${devices[0].lastSeen.toISOString()}`);
        
        for (let i = 1; i < devices.length; i++) {
          console.log(`   ❌ Will delete: ${devices[i].name} (ID: ${devices[i].deviceId})`);
          console.log(`      Firestore ID: ${devices[i].firestoreId}`);
          console.log(`      Status: ${devices[i].status}, Last: ${devices[i].lastSeen.toISOString()}`);
          toDelete.add(devices[i].firestoreId);
        }
      }
    }
    
    // Perform deletions
    if (toDelete.size > 0) {
      console.log(`\n🗑️  Deleting ${toDelete.size} duplicate device(s)...`);
      for (const firestoreId of toDelete) {
        await deleteDoc(doc(db, 'config', 'devices', 'list', firestoreId));
        duplicatesRemoved++;
        console.log(`   ✅ Deleted: ${firestoreId}`);
      }
    }
    
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Total devices scanned: ${snapshot.docs.length}`);
    console.log(`   Duplicate groups found: ${duplicatesFound}`);
    console.log(`   Devices removed: ${duplicatesRemoved}`);
    console.log(`   Remaining devices: ${snapshot.docs.length - duplicatesRemoved}`);
    
  } catch (error: any) {
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  }
}

cleanupDuplicateDevices()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
