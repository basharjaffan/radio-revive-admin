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
  ExternalLink
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

  // Settings
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  useEffect(() => {
    const unsubscribeDevice = devicesApi.subscribeToDevice(resolvedParams.id, (data) => {
      setDevice(data);
      if (data?.groupId) {
        setSelectedGroup(data.groupId);
      }
      setLoading(false);
    });

    const unsubscribeGroups = groupsApi.subscribe(setGroups);

    return () => {
      unsubscribeDevice();
      unsubscribeGroups();
    };
  }, [resolvedParams.id]);

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

  const handleRestart = async () => {
    if (!device) return;
    if (!confirm('Är du säker på att du vill starta om enheten? Detta tar ca 30 sekunder.')) return;
    
    setUpdating(true);
    await commandsApi.sendSystemUpdate(device.id);
    alert('✅ Enheten startar om nu. Vänta 30 sekunder...');
    
    setTimeout(() => {
      setUpdating(false);
      window.location.reload();
    }, 30000);
  };

  const handleSystemUpdate = async () => {
    if (!device) return;
    if (!confirm('Detta kommer uppdatera systemet och starta om enheten. Fortsätt?')) return;
    
    setUpdating(true);
    await commandsApi.sendSystemUpdate(device.id);
    alert('✅ Uppdatering initierad! Enheten kommer starta om om ~30 sekunder.');
    
    setTimeout(() => {
      setUpdating(false);
      window.location.reload();
    }, 30000);
  };

  const handleGroupChange = async () => {
    if (!device || !selectedGroup) return;
    
    setUpdating(true);
    const selectedGroupData = groups.find(g => g.id === selectedGroup);
    
    if (selectedGroupData) {
      // Update device with new group and stream URL
      await devicesApi.update(device.id, {
        groupId: selectedGroup,
        streamUrl: selectedGroupData.streamUrl,
      });
      
      // If device is playing, restart with new stream
      if (device.status === 'playing') {
        await commandsApi.send(device.id, 'stop');
        setTimeout(async () => {
          await commandsApi.send(device.id, 'play', selectedGroupData.streamUrl);
        }, 1000);
      }
      
      alert('✅ Grupp uppdaterad! Musik kommer börja spela med ny stream om enheten är aktiv.');
    }
    
    setUpdating(false);
  };

  const handleWifiConfig = async () => {
    if (!device || !wifiSSID || !wifiPassword) {
      alert('Fyll i både SSID och lösenord');
      return;
    }
    
    setUpdating(true);
    await commandsApi.sendWifiConfig(device.id, wifiSSID, wifiPassword);
    alert('✅ WiFi-konfiguration skickad! Enheten kommer att ansluta till det nya nätverket.');
    setUpdating(false);
    setWifiSSID('');
    setWifiPassword('');
  };

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

  const getStatusBadge = (status: Device['status']) => {
    const config = {
      online: { color: 'bg-green-100 text-green-800', label: 'Online' },
      playing: { color: 'bg-blue-100 text-blue-800', label: 'Playing' },
      offline: { color: 'bg-red-100 text-red-800', label: 'Offline' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      unconfigured: { color: 'bg-gray-100 text-gray-800', label: 'Unconfigured' },
    };
    const { color, label } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/devices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{device.name}</h1>
            {getStatusBadge(device.status)}
          </div>
          <p className="text-gray-500">{device.id}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={handlePlay} disabled={device.status === 'playing'}>
            <Play className="h-4 w-4 mr-2" />
            Play
          </Button>
          <Button onClick={handlePause} variant="outline" disabled={device.status !== 'playing'}>
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
          <Button onClick={handleStop} variant="outline">
            <Power className="h-4 w-4 mr-2" />
            Stop
          </Button>
          <Button onClick={handleRestart} variant="outline" disabled={updating}>
            {updating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Restart Device
          </Button>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{device.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">IP Address</p>
            <p className="font-medium">{device.ipAddress || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Seen</p>
            <p className="font-medium">
              {device.lastSeen ? format(new Date(device.lastSeen), 'MMM dd, HH:mm:ss') : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uptime</p>
            <p className="font-medium">
              {device.uptime ? `${Math.floor(device.uptime / 3600)}h ${Math.floor((device.uptime % 3600) / 60)}m` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Firmware Version</p>
            <p className="font-medium">{device.firmwareVersion || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">WiFi Configured</p>
            <p className="font-medium">{device.wifiConfigured ? 'Yes' : 'No'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-2">Current Stream URL</p>
            {device.streamUrl ? (
              <a 
                href={device.streamUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
              >
                {device.streamUrl}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="font-medium">Not configured</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Group Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Group Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assign to Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGroupChange} disabled={updating || !selectedGroup}>
            {updating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Group
          </Button>
        </CardContent>
      </Card>

      {/* WiFi Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WiFi Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ssid">Network Name (SSID)</Label>
            <Input
              id="ssid"
              value={wifiSSID}
              onChange={(e) => setWifiSSID(e.target.value)}
              placeholder="MyNetwork"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={handleWifiConfig} disabled={updating || !wifiSSID || !wifiPassword}>
            {updating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4 mr-2" />
            )}
            Configure WiFi
          </Button>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleSystemUpdate} variant="outline" className="w-full" disabled={updating}>
            {updating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Update & Restart System
          </Button>
          <p className="text-sm text-gray-500">
            This will pull the latest code, update dependencies, and restart the device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
