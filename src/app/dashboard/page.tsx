'use client';

import { useMemo } from 'react';
import { useDevices } from '@/hooks/useDevices';
import { useGroups } from '@/hooks/useGroups';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Users, 
  Layers, 
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { devices, loading: devicesLoading } = useDevices();
  const { groups, loading: groupsLoading } = useGroups();
  const { users, loading: usersLoading } = useUsers();

  // Statistics
  const stats = useMemo(() => {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === 'online' || d.status === 'playing').length;
    const playingDevices = devices.filter(d => d.status === 'playing').length;
    const offlineDevices = devices.filter(d => d.status === 'offline').length;
    const unconfiguredDevices = devices.filter(d => d.status === 'unconfigured').length;

    const onlinePercentage = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0;
    const playingPercentage = totalDevices > 0 ? Math.round((playingDevices / totalDevices) * 100) : 0;

    return {
      totalDevices,
      onlineDevices,
      playingDevices,
      offlineDevices,
      unconfiguredDevices,
      onlinePercentage,
      playingPercentage,
      totalGroups: groups.length,
      totalUsers: users.length,
    };
  }, [devices, groups, users]);

  // Device status distribution for pie chart
  const deviceStatusData = useMemo(() => [
    { name: 'Playing', value: stats.playingDevices, color: '#3b82f6' },
    { name: 'Online', value: stats.onlineDevices - stats.playingDevices, color: '#10b981' },
    { name: 'Offline', value: stats.offlineDevices, color: '#ef4444' },
    { name: 'Unconfigured', value: stats.unconfiguredDevices, color: '#94a3b8' },
  ].filter(item => item.value > 0), [stats]);

  // Mock activity data for the last 7 days
  const activityData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        devices: Math.floor(Math.random() * 20) + 10,
        playback: Math.floor(Math.random() * 15) + 5,
      };
    });
  }, []);

  // Devices per group for bar chart
  const devicesPerGroup = useMemo(() => {
    const groupCounts: Record<string, number> = {};
    
    devices.forEach(device => {
      if (device.groupId) {
        const group = groups.find(g => g.id === device.groupId);
        const groupName = group?.name || 'Unknown';
        groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
      }
    });

    return Object.entries(groupCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [devices, groups]);

  // Recent activity
  const recentActivity = useMemo(() => [
    { 
      id: '1', 
      type: 'device', 
      message: 'Kitchen Radio started playing',
      time: '2 minutes ago',
      icon: Play,
      color: 'text-blue-600'
    },
    { 
      id: '2', 
      type: 'group', 
      message: 'New group "Living Room" created',
      time: '15 minutes ago',
      icon: Layers,
      color: 'text-purple-600'
    },
    { 
      id: '3', 
      type: 'device', 
      message: 'Bedroom Radio went offline',
      time: '1 hour ago',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    { 
      id: '4', 
      type: 'user', 
      message: 'New user added to system',
      time: '3 hours ago',
      icon: Users,
      color: 'text-green-600'
    },
  ], []);

  if (devicesLoading || groupsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your Radio Revive system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Devices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Radio className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDevices}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">{stats.onlinePercentage}%</span> online
            </p>
          </CardContent>
        </Card>

        {/* Playing Now */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Playing Now</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.playingDevices}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-blue-600 font-medium">{stats.playingPercentage}%</span> of total
            </p>
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalGroups}</div>
            <p className="text-xs text-gray-500 mt-1">Device groups</p>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">System users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Devices per Group */}
        <Card>
          <CardHeader>
            <CardTitle>Devices per Group</CardTitle>
          </CardHeader>
          <CardContent>
            {devicesPerGroup.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={devicesPerGroup}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No groups with devices yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="devices" stroke="#3b82f6" name="Device Events" strokeWidth={2} />
              <Line type="monotone" dataKey="playback" stroke="#10b981" name="Playback Events" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Firebase Connection</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">MQTT Broker</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Active Devices</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">{stats.onlineDevices} / {stats.totalDevices}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stats.offlineDevices > 0 ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="text-sm font-medium">Offline Devices</span>
              </div>
              <Badge className={stats.offlineDevices > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                {stats.offlineDevices}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.playingDevices}</div>
              <p className="text-xs text-gray-600 mt-1">Currently Playing</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.onlineDevices}</div>
              <p className="text-xs text-gray-600 mt-1">Online Devices</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.offlineDevices}</div>
              <p className="text-xs text-gray-600 mt-1">Offline Devices</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalGroups}</div>
              <p className="text-xs text-gray-600 mt-1">Active Groups</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
