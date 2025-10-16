'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi, commandsApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  VolumeX,
  Wifi,
  Save
} from 'lucide-react';
import type { Device } from '@/types';
import { format } from 'date-fns';

export default function DeviceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState<string>('');
  
  const [networkSettings, setNetworkSettings] = useState({
    ipAddress: '',
    gateway: '',
    dns: '',
  });
  
  const [wifiSettings, setWifiSettings] = useState({
    ssid: '',
    password: '',
  });
  
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const unsubscribe = devicesApi.subscribe((devices) => {
      const foundDevice = devices.find(d => d.id === resolvedParams.id);
      setDevice(foundDevice || null);
      if (foundDevice) {
        setVolume(foundDevice.volume || 50);
        setNetworkSettings({
          ipAddress: foundDevice.ipAddress || '',
          gateway: '',
          dns: '',
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolvedParams.id]);

  const sendCommand = async (action: 'play' | 'pause' | 'stop', streamUrl?: string) => {
    if (!device) return;
    
    setActionLoading(action);
    try {
      const urlToPlay = streamUrl || device.streamUrl || device.currentUrl;
      await commandsApi.send(device.id, action, urlToPlay);
      setTimeout(() => setActionLoading(null), 2000);
    } catch (error) {
      console.error('Failed to send command:', error);
      alert('Failed to send command');
      setActionLoading(null);
    }
  };

  const handleFullSystemUpdate = async () => {
    if (!device) return;
    
    if (!confirm('Perform full system update? This includes:\n- Git pull\n- DietPi update\n- Package cleanup\n- System restart\n\nThis will take several minutes.')) {
      return;
    }

    setActionLoading('full-update');
    setUpdateProgress('Starting system update...');
    
    try {
      await commandsApi.sendSystemUpdate(device.id);
      
      setTimeout(() => setUpdateProgress('Pulling latest code from Git... (20%)'), 2000);
      setTimeout(() => setUpdateProgress('Updating DietPi system... (40%)'), 5000);
      setTimeout(() => setUpdateProgress('Cleaning up packages... (60%)'), 10000);
      setTimeout(() => setUpdateProgress('Restarting device... (80%)'), 15000);
      setTimeout(() => {
        setUpdateProgress('Update complete! (100%)');
        setActionLoading(null);
      }, 20000);
    } catch (error) {
      console.error('Failed to initiate update:', error);
      alert('Failed to initiate update');
      setActionLoading(null);
      setUpdateProgress('');
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!device) return;
    
    setVolume(newVolume);
    
    try {
      await devicesApi.update(device.id, { volume: newVolume });
      await commandsApi.sendVolume(device.id, newVolume);
    } catch (error) {
      console.error('Failed to update volume:', error);
    }
  };

  const handleNetworkUpdate = async () => {
    if (!device) return;
    
    setActionLoading('network');
    try {
      await devicesApi.update(device.id, networkSettings);
      alert('Network settings updated. Device may need to restart.');
      setTimeout(() => setActionLoading(null), 2000);
    } catch (error) {
      console.error('Failed to update network settings:', error);
      alert('Failed to update network settings');
      setActionLoading(null);
    }
  };

  const handleWifiUpdate = async () => {
    if (!device || !wifiSettings.ssid) return;
    
    setActionLoading('wifi');
    try {
      await commandsApi.sendWifiConfig(device.id, wifiSettings.ssid, wifiSettings.password);
      alert('WiFi settings updated. Device will restart.');
      setWifiSettings({ ssid: '', password: '' });
      setTimeout(() => setActionLoading(null), 2000);
    } catch (error) {
      console.error('Failed to update WiFi settings:', error);
      alert('Failed to update WiFi settings');
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Device['status']) => {
    const config: Record<Device['status'], { color: string; icon: any }> = {
      online: { color: 'bg-green-100 text-green-800', icon: Activity },
      playing: { color: 'bg-blue-100 text-blue-800', icon: Play },
      offline: { color: 'bg-red-100 text-red-800', icon: Power },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      unconfigured: { color: 'bg-gray-100 text-gray-800', icon: Radio },
    };

    const { color, icon: Icon } = config[status];

    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Radio className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Device not found</h2>
        <Button className="mt-4" onClick={() => router.push('/dashboard/devices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/devices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{device.name}</h1>
            <p className="text-gray-500 font-mono text-sm">{device.id}</p>
          </div>
          {getStatusBadge(device.status)}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="lg"
            onClick={() => sendCommand('play')}
            disabled={actionLoading === 'play' || device.status === 'playing'}
          >
            {actionLoading === 'play' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => sendCommand('pause')}
            disabled={actionLoading === 'pause'}
          >
            {actionLoading === 'pause' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Pause className="h-5 w-5" />
            )}
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => sendCommand('stop')}
            disabled={actionLoading === 'stop'}
          >
            {actionLoading === 'stop' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Power className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm font-medium capitalize">{device.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IP Address</p>
                <p className="font-mono text-sm font-medium">{device.ipAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Seen</p>
                <p className="text-sm font-medium">
                  {format(new Date(device.lastSeen), 'MMM dd, HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-sm font-medium">{formatUptime(device.uptime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Firmware Version</p>
                <p className="text-sm font-medium">{device.firmwareVersion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">WiFi Configured</p>
                <p className="text-sm font-medium">{device.wifiConfigured ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Current Stream URL</p>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                {device.currentUrl || device.streamUrl || 'No stream configured'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <VolumeX className="h-5 w-5 text-gray-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <Volume2 className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold">{volume}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="192.168.1.100"
                value={networkSettings.ipAddress}
                onChange={(e) => setNetworkSettings({ ...networkSettings, ipAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                id="gateway"
                placeholder="192.168.1.1"
                value={networkSettings.gateway}
                onChange={(e) => setNetworkSettings({ ...networkSettings, gateway: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dns">DNS Server</Label>
              <Input
                id="dns"
                placeholder="8.8.8.8"
                value={networkSettings.dns}
                onChange={(e) => setNetworkSettings({ ...networkSettings, dns: e.target.value })}
              />
            </div>
          </div>
          <Button 
            className="mt-4"
            onClick={handleNetworkUpdate}
            disabled={actionLoading === 'network'}
          >
            {actionLoading === 'network' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Network Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WiFi Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ssid">WiFi SSID</Label>
              <Input
                id="ssid"
                placeholder="MyWiFiNetwork"
                value={wifiSettings.ssid}
                onChange={(e) => setWifiSettings({ ...wifiSettings, ssid: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">WiFi Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={wifiSettings.password}
                onChange={(e) => setWifiSettings({ ...wifiSettings, password: e.target.value })}
              />
            </div>
          </div>
          <Button 
            className="mt-4"
            onClick={handleWifiUpdate}
            disabled={actionLoading === 'wifi' || !wifiSettings.ssid}
          >
            {actionLoading === 'wifi' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Update WiFi Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Perform a complete system update including Git pull, DietPi update, package cleanup, and system restart.
            </p>
            {updateProgress && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">{updateProgress}</p>
                </div>
              </div>
            )}
            <Button 
              className="w-full"
              variant="destructive"
              onClick={handleFullSystemUpdate}
              disabled={!!actionLoading}
            >
              {actionLoading === 'full-update' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating System...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Full System Update & Restart
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
