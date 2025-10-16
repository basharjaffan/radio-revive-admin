'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Key, 
  Database,
  Wifi,
  Save,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { settings: firebaseSettings, loading, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [settings, setSettings] = useState({
    organizationName: 'Radio Revive',
    mqttUrl: 'mqtt://localhost:1883',
    defaultStreamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3',
    heartbeatInterval: 20,
    notificationsEnabled: true,
    emailNotifications: true,
    deviceOfflineThreshold: 30,
    autoRestart: true,
    apiKey: 'rr_' + Math.random().toString(36).substring(2, 15),
  });

  useEffect(() => {
    if (firebaseSettings) {
      setSettings(prev => ({
        ...prev,
        ...firebaseSettings,
      }));
    }
  }, [firebaseSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Always use create which will set/overwrite
      await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const regenerateApiKey = () => {
    if (confirm('Are you sure you want to regenerate the API key?')) {
      setSettings({
        ...settings,
        apiKey: 'rr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">Configure your Radio Revive system</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Basic configuration for your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={settings.organizationName}
              onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              This name will appear in the sidebar
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-stream">Default Stream URL</Label>
            <Input
              id="default-stream"
              type="url"
              value={settings.defaultStreamUrl}
              onChange={(e) => setSettings({ ...settings, defaultStreamUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heartbeat">Heartbeat Interval (seconds)</Label>
            <Input
              id="heartbeat"
              type="number"
              min="5"
              max="300"
              value={settings.heartbeatInterval}
              onChange={(e) => setSettings({ ...settings, heartbeatInterval: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <CardTitle>MQTT Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="mqtt-url">MQTT Broker URL</Label>
            <Input
              id="mqtt-url"
              value={settings.mqttUrl}
              onChange={(e) => setSettings({ ...settings, mqttUrl: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Notifications</Label>
              <p className="text-xs text-gray-500">Receive system alerts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-restart Devices</Label>
              <p className="text-xs text-gray-500">Restart failed devices</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRestart}
              onChange={(e) => setSettings({ ...settings, autoRestart: e.target.checked })}
              className="h-4 w-4 rounded"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>API Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" onClick={copyApiKey}>
                {copiedApiKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={regenerateApiKey}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Firebase</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs text-gray-500">Project ID</Label>
            <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
