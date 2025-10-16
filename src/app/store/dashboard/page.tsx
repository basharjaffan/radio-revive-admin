'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { commandsApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Play, Pause, Square, Volume2, RefreshCw, LogOut, Radio } from 'lucide-react';
import type { Device } from '@/types';

export default function StoreDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('storeUser');
    if (!storedUser) {
      router.push('/store');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    if (userData.deviceId) {
      const deviceRef = doc(db, 'config', 'devices', 'list', userData.deviceId);
      const unsubscribe = onSnapshot(deviceRef, (snapshot) => {
        if (snapshot.exists()) {
          const deviceData = { id: snapshot.id, ...snapshot.data() } as Device;
          setDevice(deviceData);
          if (deviceData.volume) {
            setVolume(deviceData.volume);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [router]);

  const handlePlay = async () => {
    if (!device) return;
    await commandsApi.send(device.id, 'play', device.streamUrl);
  };

  const handlePause = async () => {
    if (!device) return;
    await commandsApi.send(device.id, 'pause');
  };

  const handleStop = async () => {
    if (!device) return;
    await commandsApi.send(device.id, 'stop');
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!device) return;
    setVolume(newVolume);
    await commandsApi.send(device.id, 'volume', undefined, newVolume);
  };

  const handleRestart = async () => {
    if (!device) return;
    if (confirm('Är du säker på att du vill starta om enheten?')) {
      await commandsApi.sendSystemUpdate(device.id);
      alert('✅ Enheten startar om nu. Vänta 30 sekunder...');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('storeUser');
    router.push('/store');
  };

  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-3xl font-bold">{user?.name || 'Butik'}</h1>
            <p className="text-sm text-gray-300">{device.name}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 ${
                device.status === 'playing' ? 'animate-pulse' : ''
              }`}>
                <Radio className="w-24 h-24 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Butik Musik</h2>
              <p className={`text-sm font-medium ${
                device.status === 'playing' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {device.status === 'playing' ? '🎵 Spelar' : '⏸️ Stoppad'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontroller</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 mb-6">
              <Button
                size="lg"
                onClick={handlePlay}
                disabled={device.status === 'playing'}
                className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-700"
              >
                <Play className="w-8 h-8" />
              </Button>
              <Button
                size="lg"
                onClick={handlePause}
                disabled={device.status !== 'playing'}
                className="w-20 h-20 rounded-full"
                variant="outline"
              >
                <Pause className="w-8 h-8" />
              </Button>
              <Button
                size="lg"
                onClick={handleStop}
                className="w-20 h-20 rounded-full"
                variant="outline"
              >
                <Square className="w-8 h-8" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Volym
                </Label>
                <span className="text-lg font-bold">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IP-adress</span>
              <span className="font-mono">{device.ipAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${device.status === 'playing' ? 'text-green-600' : ''}`}>
                {device.status}
              </span>
            </div>
            <Button
              onClick={handleRestart}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Starta om enhet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
