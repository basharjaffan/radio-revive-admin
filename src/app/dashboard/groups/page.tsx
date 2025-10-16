'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi, devicesApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Plus, Music, Upload, X, Loader2 } from 'lucide-react';
import type { Group, Device } from '@/types';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    streamUrl: '',
    musicFiles: [] as string[],
  });

  useEffect(() => {
    const unsubGroups = groupsApi.subscribe(setGroups);
    const unsubDevices = devicesApi.subscribe((data) => {
      setDevices(data);
      setLoading(false);
    });

    return () => {
      unsubGroups();
      unsubDevices();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Upload to first online device
    const onlineDevice = devices.find(d => d.status === 'online' || d.status === 'playing');
    if (!onlineDevice) {
      alert('❌ Ingen enhet online för att ta emot filer');
      return;
    }

    setUploading(true);
    const uploadedFiles: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('files', file);

        const response = await fetch(`http://${onlineDevice.ipAddress}/api/upload-music`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push(...result.files.map((f: any) => f.name));
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }
      }

      setFormData(prev => ({
        ...prev,
        musicFiles: [...prev.musicFiles, ...uploadedFiles]
      }));

      alert(`✅ ${files.length} filer uppladdade till enheten!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Uppladdning misslyckades');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (filename: string) => {
    setFormData(prev => ({
      ...prev,
      musicFiles: prev.musicFiles.filter(f => f !== filename)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await groupsApi.create(formData);
      setFormData({ name: '', streamUrl: '', musicFiles: [] });
      setShowForm(false);
      alert('✅ Grupp skapad!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('❌ Kunde inte skapa grupp');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const onlineDevice = devices.find(d => d.status === 'online' || d.status === 'playing');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-gray-500">Manage device groups and music</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Store Music"
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
                  placeholder="https://stream.example.com/radio"
                />
              </div>

              {/* Local Music Upload */}
              <div className="space-y-2">
                <Label>Lokala Musikfiler</Label>
                {!onlineDevice ? (
                  <div className="border border-yellow-500 rounded-lg p-4 bg-yellow-50">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Ingen enhet online. Anslut en enhet för att ladda upp filer.
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="music-upload"
                      multiple
                      accept="audio/mpeg,audio/flac,audio/wav"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <label htmlFor="music-upload" className="cursor-pointer">
                      {uploading ? (
                        <div className="space-y-2">
                          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                          <p className="text-sm text-gray-600">Laddar upp... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Ladda upp MP3/FLAC/WAV till {onlineDevice.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Filerna sparas lokalt på enheten
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {formData.musicFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Uppladdade filer ({formData.musicFiles.length})
                    </p>
                    {formData.musicFiles.map((filename, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{filename}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(filename)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Group</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/dashboard/groups/${group.id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 truncate">
                {group.streamUrl || 'Lokala filer'}
              </p>
              {group.musicFiles && group.musicFiles.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                  <Music className="w-3 h-3" />
                  {group.musicFiles.length} lokala filer
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
