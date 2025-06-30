import { useState, useEffect } from 'react';
import { fetchParticipants, fetchHasContributedBatch } from '../lib/services/roscaService';
import { roscaAbi } from '../lib/contracts/rosca.artifacts';
import { PublicClient } from 'viem';

export interface UseRoscaParticipantsParams {
  contractAddress?: string;
  totalParticipants?: bigint | null;
  publicClient?: PublicClient;
  refreshKey?: number;
}

export function useRoscaParticipants({ contractAddress, totalParticipants, publicClient, refreshKey }: UseRoscaParticipantsParams) {
  const [participants, setParticipants] = useState<{
    id: number;
    address: `0x${string}`;
    status: 'paid' | 'pending';
    turn: number;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!contractAddress || typeof totalParticipants !== 'bigint' || !publicClient) return;
      setLoading(true);
      setError(null);
      try {
        const addresses = await fetchParticipants({
          contractAddress,
          totalParticipants: Number(totalParticipants),
          publicClient,
          roscaAbi,
        });
        const statuses = await fetchHasContributedBatch({
          contractAddress,
          publicClient,
          roscaAbi,
          addresses,
        });
        const participantsList = addresses.map((addr, i) => ({
          id: i + 1,
          address: addr,
          status: statuses[i] === true ? 'paid' : 'pending' as 'paid' | 'pending',
          turn: i + 1,
        }));
        setParticipants(participantsList);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch participants');
        } else {
          setError('An unknown error occurred while fetching participants.');
        }
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [contractAddress, totalParticipants, publicClient, refreshKey]);

  return { participants, loading, error };
}
