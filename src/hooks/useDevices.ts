import { useState, useEffect } from 'react';
import { devicesApi } from '@/services/firebase-api';
import type { Device } from '@/types';

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = devicesApi.subscribe((devicesData) => {
      setDevices(devicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { devices, loading, error };
}
