'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupsApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, Plus, Music, Upload, X, Loader2 } from 'lucide-react';
import type { Group } from '@/types';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
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
    const unsubscribe = groupsApi.subscribe((data) => {
      setGroups(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const storage = getStorage();
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `music/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(prog));
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              urls.push(downloadURL);
              resolve(downloadURL);
            }
          );
        });
      }

      setFormData(prev => ({
        ...prev,
        musicFiles: [...prev.musicFiles, ...urls]
      }));
      
      alert(`✅ ${files.length} filer uppladdade!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Uppladdning misslyckades');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (url: string) => {
    setFormData(prev => ({
      ...prev,
      musicFiles: prev.musicFiles.filter(f => f !== url)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-gray-500">Manage device groups and music streams</p>
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
                <Label htmlFor="streamUrl">Stream URL (valfritt)</Label>
                <Input
                  id="streamUrl"
                  type="url"
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  placeholder="https://stream.example.com/radio"
                />
                <p className="text-xs text-gray-500">
                  Lämna tom om du bara vill använda lokala filer
                </p>
              </div>

              {/* Music Upload */}
              <div className="space-y-2">
                <Label>Lokala Musikfiler</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="music-upload"
                    multiple
                    accept="audio/mpeg,audio/flac,audio/wav,audio/mp3"
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
                          Klicka för att ladda upp MP3, FLAC eller WAV
                        </p>
                        <p className="text-xs text-gray-400">
                          Filerna sparas lokalt på alla enheter
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {formData.musicFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Uppladdade filer ({formData.musicFiles.length})
                    </p>
                    {formData.musicFiles.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-blue-600" />
                          <span className="text-sm truncate max-w-xs">
                            {decodeURIComponent(url.split('/').pop()?.split('?')[0] || '')}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(url)}
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
