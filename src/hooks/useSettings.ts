import { useState, useEffect } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just return empty settings
    // We can implement this properly later
    setSettings({});
    setLoading(false);
  }, []);

  return { settings, loading };
}
