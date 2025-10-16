import { useState, useEffect } from 'react';
import { settingsApi } from '@/services/firebase-api';

export function useSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = settingsApi.subscribe((settingsData) => {
      setSettings(settingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (data: any) => {
    try {
      await settingsApi.update(data);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}
