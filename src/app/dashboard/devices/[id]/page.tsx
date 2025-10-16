'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { devicesApi, groupsApi, commandsApi } from '@/services/firebase-api';
// ... (resten av importen är samma)

// Lägg till i component:
const [updating, setUpdating] = useState(false);
const [restarting, setRestarting] = useState(false);

const handleSystemUpdate = async () => {
  if (!confirm('Detta kommer uppdatera systemet och starta om enheten. Fortsätt?')) return;
  
  setUpdating(true);
  try {
    await commandsApi.sendSystemUpdate(device.id);
    alert('✅ Uppdatering initierad! Enheten kommer starta om om ~30 sekunder.');
    
    // Vänta 30 sekunder och refresha
    setTimeout(() => {
      setUpdating(false);
      window.location.reload();
    }, 30000);
  } catch (error) {
    console.error('Update failed:', error);
    alert('❌ Uppdatering misslyckades');
    setUpdating(false);
  }
};

const handleRestart = async () => {
  if (!confirm('Är du säker på att du vill starta om enheten?')) return;
  
  setRestarting(true);
  try {
    await commandsApi.sendSystemUpdate(device.id);
    alert('✅ Enheten startar om nu. Vänta 30 sekunder...');
    
    setTimeout(() => {
      setRestarting(false);
      window.location.reload();
    }, 30000);
  } catch (error) {
    console.error('Restart failed:', error);
    alert('❌ Omstart misslyckades');
    setRestarting(false);
  }
};
