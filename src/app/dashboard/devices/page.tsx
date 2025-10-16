'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi, groupsApi, commandsApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Radio, 
  Plus, 
  Trash2, 
  Search, 
  Loader2,
  Play,
  Pause,
  Power,
  RefreshCw,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import type { Device, Group } from '@/types';
import { format } from 'date-fns';

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  
  // Bulk operations
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkGroup, setBulkGroup] = useState<string>('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribeDevices = devicesApi.subscribe(setDevices);
    const unsubscribeGroups = groupsApi.subscribe(setGroups);
    setLoading(false);

    return () => {
      unsubscribeDevices();
      unsubscribeGroups();
    };
  }, []);

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deviceToDelete) return;

    try {
      await devicesApi.delete(deviceToDelete.id);
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    } catch (error) {
      console.error('Failed to delete device:', error);
      alert('Failed to delete device');
    }
  };

  const toggleDeviceSelection = (deviceId: string) => {
    const newSelection = new Set(selectedDevices);
    if (newSelection.has(deviceId)) {
      newSelection.delete(deviceId);
    } else {
      newSelection.add(deviceId);
    }
    setSelectedDevices(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedDevices.size === filteredDevices.length) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(filteredDevices.map(d => d.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedDevices.size === 0) {
      alert('Please select at least one device');
      return;
    }

    if (!bulkAction) {
      alert('Please select an action');
      return;
    }

    setBulkActionLoading(true);

    try {
      const deviceIds = Array.from(selectedDevices);

      switch (bulkAction) {
        case 'play':
          for (const deviceId of deviceIds) {
            const device = devices.find(d => d.id === deviceId);
            if (device) {
              await commandsApi.send(deviceId, 'play', device.streamUrl);
            }
          }
          break;

        case 'pause':
          for (const deviceId of deviceIds) {
            await commandsApi.send(deviceId, 'pause');
          }
          break;

        case 'stop':
          for (const deviceId of deviceIds) {
            await commandsApi.send(deviceId, 'stop');
          }
          break;

        case 'restart':
          for (const deviceId of deviceIds) {
            await commandsApi.sendSystemUpdate(deviceId);
          }
          break;

        case 'assign_group':
          if (!bulkGroup) {
            alert('Please select a group');
            setBulkActionLoading(false);
            return;
          }
          for (const deviceId of deviceIds) {
            await devicesApi.update(deviceId, { groupId: bulkGroup });
          }
          break;

        case 'delete':
          if (confirm(`Are you sure you want to delete ${deviceIds.length} device(s)?`)) {
            for (const deviceId of deviceIds) {
              await devicesApi.delete(deviceId);
            }
            setSelectedDevices(new Set());
          }
          break;
      }

      setBulkAction('');
      setBulkGroup('');
      setTimeout(() => setBulkActionLoading(false), 2000);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Bulk action failed');
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: Device['status']) => {
    const config: Record<Device['status'], { color: string; label: string }> = {
      online: { color: 'bg-green-100 text-green-800', label: 'Online' },
      playing: { color: 'bg-blue-100 text-blue-800', label: 'Playing' },
      offline: { color: 'bg-red-100 text-red-800', label: 'Offline' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      unconfigured: { color: 'bg-gray-100 text-gray-800', label: 'Unconfigured' },
    };

    const { color, label } = config[status];

    return (
      <Badge className={color}>
        {label}
      </Badge>
    );
  };

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'No group';
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Unknown group';
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
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-gray-500">Manage your radio devices</p>
        </div>
        <Button onClick={() => router.push('/dashboard/devices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedDevices.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedDevices.size} device(s) selected
                </span>
              </div>

              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="play">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Play
                    </div>
                  </SelectItem>
                  <SelectItem value="pause">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </div>
                  </SelectItem>
                  <SelectItem value="stop">
                    <div className="flex items-center gap-2">
                      <Power className="h-4 w-4" />
                      Stop
                    </div>
                  </SelectItem>
                  <SelectItem value="restart">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Update & Restart
                    </div>
                  </SelectItem>
                  <SelectItem value="assign_group">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Assign to Group
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {bulkAction === 'assign_group' && (
                <Select value={bulkGroup} onValueChange={setBulkGroup}>
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button 
                onClick={handleBulkAction}
                disabled={bulkActionLoading || !bulkAction}
              >
                {bulkActionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>

              <Button 
                variant="outline"
                onClick={() => setSelectedDevices(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Devices ({filteredDevices.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDevices.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first device'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <button onClick={toggleSelectAll}>
                      {selectedDevices.size === filteredDevices.length ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow 
                    key={device.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleDeviceSelection(device.id)}>
                        {selectedDevices.has(device.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={() => router.push(`/dashboard/devices/${device.id}`)}
                    >
                      {device.name}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/devices/${device.id}`)}>
                      {getStatusBadge(device.status)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/devices/${device.id}`)}>
                      <code className="text-sm">{device.ipAddress || 'N/A'}</code>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/devices/${device.id}`)}>
                      {getGroupName(device.groupId)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/dashboard/devices/${device.id}`)}>
                      {format(new Date(device.lastSeen), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeviceToDelete(device);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deviceToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
