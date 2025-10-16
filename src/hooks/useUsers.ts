import { useState, useEffect } from 'react';
import { usersApi } from '@/services/firebase-api';
import type { User } from '@/types/user';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = usersApi.subscribe((usersData) => {
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addUser = async (email: string, firstName: string, lastName: string, role: 'admin' | 'user') => {
    try {
      await usersApi.create(email, firstName, lastName, role);
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      await usersApi.update(userId, data);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await usersApi.delete(userId);
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  return { users, loading, error, addUser, updateUser, deleteUser };
}
