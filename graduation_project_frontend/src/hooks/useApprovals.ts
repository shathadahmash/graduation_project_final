import { useState, useEffect } from 'react';
import { approvalService } from '../services/approvalService';
import { useApprovalsStore } from '../store/useStore';

export const useApprovals = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setApprovals } = useApprovalsStore();

  const fetchApprovals = async (status?: string) => {
    setIsLoading(true);
    try {
      const data = await approvalService.getApprovals(status);
      setApprovals(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals('pending');
  }, []);

  return { isLoading, error, refetch: fetchApprovals };
};
