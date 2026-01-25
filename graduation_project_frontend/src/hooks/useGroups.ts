import { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import { useInvitationsStore } from '../store/useStore';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setInvitations } = useInvitationsStore();

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupService.getGroups();
      setGroups(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const data = await groupService.getInvitations();
      setInvitations(data);
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchInvitations();
  }, []);

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
  };
};
