'use client';

import { useState, useMemo } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { useDevices } from '@/hooks/useDevices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Layers, Trash2, Edit, ExternalLink, Radio, Loader2, Plus } from 'lucide-react';

export default function GroupsPage() {
  const { groups, loading: groupsLoading, createGroup, updateGroup, deleteGroup } = useGroups();
  const { devices, loading: devicesLoading } = useDevices();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [newGroup, setNewGroup] = useState({ name: '', streamUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  const deviceCountByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach((device) => {
      if (device.groupId) {
        counts[device.groupId] = (counts[device.groupId] || 0) + 1;
      }
    });
    return counts;
  }, [devices]);

  const getDevicesForGroup = (groupId: string) => {
    return devices.filter((device) => device.groupId === groupId);
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name) return;
    setIsSubmitting(true);
    try {
      await createGroup(newGroup.name, newGroup.streamUrl);
      setIsAddDialogOpen(false);
      setNewGroup({ name: '', streamUrl: '' });
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup || !editingGroup.name) return;
    setIsSubmitting(true);
    try {
      await updateGroup(editingGroup.id, {
        name: editingGroup.name,
        streamUrl: editingGroup.streamUrl,
      });
      setIsEditDialogOpen(false);
      setEditingGroup(null);
    } catch (err) {
      console.error('Failed to update group:', err);
      alert('Failed to update group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const devicesInGroup = deviceCountByGroup[groupId] || 0;
    if (devicesInGroup > 0) {
      if (!confirm(`This group has ${devicesInGroup} device(s). Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this group?')) {
        return;
      }
    }
    setDeletingGroupId(groupId);
    try {
      await deleteGroup(groupId);
    } catch (err) {
      console.error('Failed to delete group:', err);
      alert('Failed to delete group. Please try again.');
    } finally {
      setDeletingGroupId(null);
    }
  };

  const openEditDialog = (group: any) => {
    setEditingGroup({
      id: group.id,
      name: group.name,
      streamUrl: group.streamUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  if (groupsLoading || devicesLoading) {
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
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-gray-500">Manage device groups and their streams</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Layers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No groups yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create groups to organize your devices and assign streaming URLs.
              </p>
              <Button className="mt-6" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const deviceCount = deviceCountByGroup[group.id] || 0;
              const groupDevices = getDevicesForGroup(group.id);
              const onlineCount = groupDevices.filter(d => d.status === 'online' || d.status === 'playing').length;

              return (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                          <Layers className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <CardDescription className="text-xs font-mono mt-1">{group.id}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Devices</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Radio className="h-3 w-3 mr-1" />
                          {deviceCount}
                        </Badge>
                        {onlineCount > 0 && (
                          <Badge className="bg-green-100 text-green-800">{onlineCount} online</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">Stream URL</span>
                      {group.streamUrl ? (
                        <div className="flex items-center gap-1 text-sm">
                          <a href={group.streamUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                            <span className="truncate">{group.streamUrl}</span>
                          </a>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 text-blue-600" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No stream URL</span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(group)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteGroup(group.id)} disabled={deletingGroupId === group.id}>
                        {deletingGroupId === group.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Groups ({groups.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Group ID</TableHead>
                      <TableHead>Devices</TableHead>
                      <TableHead>Stream URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => {
                      const deviceCount = deviceCountByGroup[group.id] || 0;
                      return (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-gray-500" />
                              {group.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-gray-500">{group.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <Radio className="h-3 w-3 mr-1" />
                              {deviceCount} device{deviceCount !== 1 ? 's' : ''}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {group.streamUrl ? (
                              <a href={group.streamUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline max-w-md truncate">
                                {group.streamUrl}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-gray-400">No stream URL</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(group)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteGroup(group.id)} disabled={deletingGroupId === group.id}>
                                {deletingGroupId === group.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Create a group to organize devices and assign streaming URLs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" placeholder="e.g., Kitchen Radios" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streamUrl">Stream URL</Label>
              <Input id="streamUrl" type="url" placeholder="https://stream.example.com/radio" value={newGroup.streamUrl} onChange={(e) => setNewGroup({ ...newGroup, streamUrl: e.target.value })} />
              <p className="text-xs text-gray-500">Optional: Set a default streaming URL for this group</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleCreateGroup} disabled={isSubmitting || !newGroup.name}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>Update group information and streaming URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name</Label>
              <Input id="edit-name" placeholder="e.g., Kitchen Radios" value={editingGroup?.name || ''} onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-streamUrl">Stream URL</Label>
              <Input id="edit-streamUrl" type="url" placeholder="https://stream.example.com/radio" value={editingGroup?.streamUrl || ''} onChange={(e) => setEditingGroup({ ...editingGroup, streamUrl: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleEditGroup} disabled={isSubmitting || !editingGroup?.name}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
