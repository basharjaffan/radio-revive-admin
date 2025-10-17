'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { devicesApi } from '@/services/firebase-api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Plus, Loader2 } from 'lucide-react';
import type { Device } from '@/types';
import { format } from 'date-fns';

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = devicesApi.subscribe((data) => {
      setDevices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: Device['status']) => {
    const config = {
      online: { color: 'bg-green-100 text-green-800', label: 'Online' },
      playing: { color: 'bg-blue-100 text-blue-800', label: 'Playing' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      offline: { color: 'bg-red-100 text-red-800', label: 'Offline' },
    };
    const { color, label } = config[status] || config.offline;
    return <Badge className={color}>{label}</Badge>;
  };

  const formatLastSeen = (lastSeen: any) => {
    if (!lastSeen) return 'Never';
    
    try {
      // Handle Firebase Timestamp
      const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
      return format(date, 'MMM dd, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-gray-500">Manage your Radio Revive devices</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            All Devices ({devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No devices found</p>
              <p className="text-sm text-gray-400">
                Install the Radio Revive agent on a Raspberry Pi to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow
                    key={device.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/dashboard/devices/${device.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p>{device.name}</p>
                        <p className="text-xs text-gray-500">{device.deviceId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {device.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {device.cpuUsage !== undefined && (
                          <div>CPU: {device.cpuUsage.toFixed(1)}%</div>
                        )}
                        {device.memoryUsage !== undefined && (
                          <div>Mem: {device.memoryUsage.toFixed(1)}%</div>
                        )}
                        {device.diskUsage !== undefined && (
                          <div>Disk: {device.diskUsage}%</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatLastSeen(device.lastSeen)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/devices/${device.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
