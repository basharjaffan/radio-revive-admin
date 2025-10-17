'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi, devicesApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, Music } from 'lucide-react';
import type { Group, Device } from '@/types';

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    streamUrl: '',
  });

  useEffect(() => {
    const unsubGroups = groupsApi.subscribe((groups) => {
      const currentGroup = groups.find(g => g.id === resolvedParams.id);
      if (currentGroup) {
        setGroup(currentGroup);
        setFormData({
          name: currentGroup.name,
          streamUrl: currentGroup.streamUrl || '',
        });
      }
      setLoading(false);
    });

    const unsubDevices = devicesApi.subscribe(setDevices);

    return () => {
      unsubGroups();
      unsubDevices();
    };
  }, [resolvedParams.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    try {
      await groupsApi.update(group.id, formData);
      alert('✅ Grupp uppdaterad!');
    } catch (error) {
      alert('❌ Kunde inte uppdatera grupp');
    }
  };

  const handleDelete = async () => {
    if (!group) return;
    if (!confirm('Är du säker på att du vill radera denna grupp?')) return;

    try {
      await groupsApi.delete(group.id);
      router.push('/dashboard/groups');
    } catch (error) {
      alert('❌ Kunde inte radera grupp');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!group) {
    return (
      <div className="text-center p-8">
        <p>Group not found</p>
        <Button onClick={() => router.push('/dashboard/groups')} className="mt-4">
          Back to Groups
        </Button>
      </div>
    );
  }

  const groupDevices = devices.filter(d => d.groupId === group.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/groups')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{group.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Group Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streamUrl">Stream URL</Label>
                <Input
                  id="streamUrl"
                  type="url"
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices ({groupDevices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {groupDevices.length === 0 ? (
              <p className="text-gray-500">No devices in this group</p>
            ) : (
              <div className="space-y-2">
                {groupDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => router.push(`/dashboard/devices/${device.id}`)}
                  >
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-gray-500">{device.ipAddress}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      device.status === 'playing' ? 'bg-green-100 text-green-800' :
                      device.status === 'online' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {group.musicFiles && group.musicFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Local Music Files ({group.musicFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.musicFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Music className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{file}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
