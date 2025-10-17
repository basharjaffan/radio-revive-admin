'use client';

import { useEffect, useState } from 'react';
import { usersApi, devicesApi } from '@/services/firebase-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users as UsersIcon, Plus, Trash2, Loader2, Mail, User, Edit2 } from 'lucide-react';
import type { User, Device } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deviceId: '',
  });

  useEffect(() => {
    const unsubUsers = usersApi.subscribe((data) => {
      setUsers(data);
      setLoading(false);
    });

    const unsubDevices = devicesApi.subscribe(setDevices);

    return () => {
      unsubUsers();
      unsubDevices();
    };
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      deviceId: user.deviceId || 'none',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Fyll i namn och email');
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        deviceId: formData.deviceId === 'none' ? undefined : formData.deviceId,
      };

      if (editingUser) {
        // Update existing user
        await usersApi.update(editingUser.id, userData);
        alert('✅ Användare uppdaterad!');
      } else {
        // Create new user
        await usersApi.create(userData);
        alert('✅ Användare skapad!');
      }
      
      setFormData({ name: '', email: '', deviceId: '' });
      setShowForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('❌ Kunde inte spara användare');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', deviceId: '' });
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Är du säker på att du vill radera denna användare?')) return;

    try {
      await usersApi.delete(userId);
      alert('✅ Användare raderad!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Kunde inte radera användare');
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
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500">Manage store users and access</p>
        </div>
        <Button onClick={() => {
          setEditingUser(null);
          setFormData({ name: '', email: '', deviceId: '' });
          setShowForm(!showForm);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? 'Edit User' : 'Create New User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Store Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="store@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">Assigned Device (Optional)</Label>
                <Select 
                  value={formData.deviceId || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, deviceId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No device assigned</SelectItem>
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name} ({device.ipAddress})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No users found</p>
              <Button onClick={() => {
                setEditingUser(null);
                setFormData({ name: '', email: '', deviceId: '' });
                setShowForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create First User
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Device</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const assignedDevice = devices.find(d => d.id === user.deviceId);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignedDevice ? (
                          <div>
                            <p className="font-medium">{assignedDevice.name}</p>
                            <p className="text-xs text-gray-500">{assignedDevice.ipAddress}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No device</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
