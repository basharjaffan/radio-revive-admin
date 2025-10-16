import { useState, useEffect } from 'react';
import { groupsApi } from '@/services/firebase-api';
import type { Group } from '@/types';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = groupsApi.subscribe((groupsData) => {
      setGroups(groupsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createGroup = async (name: string, streamUrl: string) => {
    try {
      await groupsApi.create(name, streamUrl);
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  };

  const updateGroup = async (groupId: string, data: Partial<Group>) => {
    try {
      await groupsApi.update(groupId, data);
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await groupsApi.delete(groupId);
    } catch (err) {
      console.error('Error deleting group:', err);
      throw err;
    }
  };

  return { groups, loading, error, createGroup, updateGroup, deleteGroup };
}
