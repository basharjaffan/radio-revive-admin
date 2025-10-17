'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Database, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">System configuration and preferences</p>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Environment</p>
              <Badge>Production</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Firebase Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Firebase Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Project ID</p>
              <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Auth Domain</p>
              <p className="font-mono text-sm truncate">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Firebase Status</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Log All Admin Actions</p>
              <p className="text-xs text-gray-500">Track all administrative changes</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Require Authentication</p>
              <p className="text-xs text-gray-500">All users must be authenticated</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Device Offline Alerts</p>
              <p className="text-xs text-gray-500">Get notified when devices go offline</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">System Update Notifications</p>
              <p className="text-xs text-gray-500">Notify when updates are available</p>
            </div>
            <input type="checkbox" className="h-4 w-4 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
