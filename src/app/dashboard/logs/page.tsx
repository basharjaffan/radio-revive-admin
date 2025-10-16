'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Activity, 
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Radio,
  Users,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'device' | 'user' | 'group' | 'system';
  action: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  user?: string;
  device?: string;
  message: string;
  details?: string;
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'device',
      action: 'device_connected',
      severity: 'success',
      device: 'Kitchen Radio',
      message: 'Device connected and started playing',
      details: 'IP: 192.168.1.100',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'user',
      action: 'group_created',
      severity: 'info',
      user: 'admin@example.com',
      message: 'New group created: Living Room',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      type: 'device',
      action: 'device_offline',
      severity: 'warning',
      device: 'Bedroom Radio',
      message: 'Device went offline',
    },
  ]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.device?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || log.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [logs, searchQuery, typeFilter, severityFilter]);

  const getSeverityBadge = (severity: LogEntry['severity']) => {
    const config = {
      info: { color: 'bg-blue-100 text-blue-800', icon: Info },
      success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      error: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const { color, icon: Icon } = config[severity];

    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {severity}
      </Badge>
    );
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    const icons = {
      device: Radio,
      user: Users,
      group: Layers,
      system: Activity,
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4 text-gray-500" />;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-gray-500">System events and user activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="device">Device</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>User/Device</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        <span className="capitalize">{log.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell className="text-sm">
                      {log.user && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {log.user}
                        </div>
                      )}
                      {log.device && (
                        <div className="flex items-center gap-1">
                          <Radio className="h-3 w-3" />
                          {log.device}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
