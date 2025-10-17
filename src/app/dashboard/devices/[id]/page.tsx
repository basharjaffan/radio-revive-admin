'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi, groupsApi, commandsApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Power,
  RefreshCw,
  ArrowLeft,
  Radio,
  Activity,
  Loader2,
  Volume2,
  Wifi,
  Save,
  ExternalLink,
  Cpu,
  HardDrive,
  Gauge,
  Network
} from 'lucide-react';
import type { Device, Group } from '@/types';
import { format } from 'date-fns';

export default function DeviceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [volume, setVolume] = useState(100);
  
  // Network settings
  const [networkConfig, setNetworkConfig] = useState({
    ipAddress: '',
    gateway: '',
    dns1: '8.8.8.8',
    dns2: '8.8.4.4',
    interface: 'eth0'
  });

  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  useEffect(() => {
    const unsubscribeDevices = devicesApi.subscribe((allDevices) => {
      const currentDevice = allDevices.find(d => d.id === resolvedParams.id);
      if (currentDevice) {
        setDevice(currentDevice);
        if (currentDevice.groupId) {
          setSelectedGroup(currentDevice.groupId);
        }
        if (currentDevice.volume !== undefined) {
          setVolume(currentDevice.volume);
        }
        if (currentDevice.ipAddress) {
          setNetworkConfig(prev => ({
            ...prev,
            ipAddress: currentDevice.ipAddress
          }));
        }
      }
      setLoading(false);
    });

    const unsubscribeGroups = groupsApi.subscribe(setGroups);

    return () => {
      unsubscribeDevices();
      unsubscribeGroups();
    };
  }, [resolvedParams.id]);

  const handleVolumeChange = async (newVolume: number) => {
    if (!device) return;
    setVolume(newVolume);
    await commandsApi.send(device.id, 'volume', undefined, newVolume);
    await devicesApi.update(device.id, { volume: newVolume });
  };

  const handleNetworkConfig = async () => {
    if (!device) return;
    if (!networkConfig.ipAddress || !networkConfig.gateway) {
      alert('Fyll i IP-adress och Gateway');
      return;
    }

    if (!confirm('Detta kommer att ändra nätverksinställningar och starta om enheten. Fortsätt?')) {
      return;
    }

    setUpdating(true);
    try {
      await commandsApi.sendNetworkConfig(
        device.id,
        networkConfig.ipAddress,
        networkConfig.gateway,
        networkConfig.dns1,
        networkConfig.dns2,
        networkConfig.interface
      );
      alert('✅ Nätverkskonfiguration skickad! Enheten startar om om 5 sekunder.');
    } catch (error) {
      alert('❌ Kunde inte konfigurera nätverk');
    } finally {
      setUpdating(false);
    }
  };

  // ... (rest of handlers same as before)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Device not found</p>
        <Button onClick={() => router.push('/dashboard/devices')} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    const isOnline = device.status === 'online' || device.status === 'playing' || device.status === 'paused';
    const isPlaying = device.status === 'playing';
    const isPaused = device.status === 'paused';
    
    return (
      <div className="flex gap-2">
        <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
        {isPlaying && <Badge className="bg-blue-100 text-blue-800">Playing</Badge>}
        {isPaused && <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Volume */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/devices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{device.name}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-gray-500">{device.id}</p>
        </div>
        
        {/* Volume Control - Top Right */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-lg border shadow-sm min-w-[300px]">
          <Volume2 className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <span className="text-xl font-bold min-w-[50px] text-right">{volume}%</span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.cpuUsage?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.memoryUsage?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disk</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.diskUsage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {device.diskUsed} / {device.diskTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={networkConfig.ipAddress}
                onChange={(e) => setNetworkConfig({...networkConfig, ipAddress: e.target.value})}
                placeholder="192.168.1.100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                id="gateway"
                value={networkConfig.gateway}
                onChange={(e) => setNetworkConfig({...networkConfig, gateway: e.target.value})}
                placeholder="192.168.1.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dns1">Primary DNS</Label>
              <Input
                id="dns1"
                value={networkConfig.dns1}
                onChange={(e) => setNetworkConfig({...networkConfig, dns1: e.target.value})}
                placeholder="8.8.8.8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dns2">Secondary DNS</Label>
              <Input
                id="dns2"
                value={networkConfig.dns2}
                onChange={(e) => setNetworkConfig({...networkConfig, dns2: e.target.value})}
                placeholder="8.8.4.4"
              />
            </div>
          </div>
          <Button onClick={handleNetworkConfig} disabled={updating}>
            {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Network className="h-4 w-4 mr-2" />}
            Apply Network Settings
          </Button>
          <p className="text-xs text-gray-500">
            ⚠️ Enheten kommer att starta om efter att nätverksinställningarna tillämpats
          </p>
        </CardContent>
      </Card>

      {/* Rest of the page... */}
    </div>
  );
}
