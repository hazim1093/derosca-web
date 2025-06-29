import { Abi } from 'viem';
import { roscaAbi, roscaBytecode } from '../contracts/rosca.artifacts';

// Fetch all participants addresses
export async function fetchParticipants({
  contractAddress,
  totalParticipants,
  publicClient,
  roscaAbi,
}: {
  contractAddress: string;
  totalParticipants: number;
  publicClient: any;
  roscaAbi: Abi;
}): Promise<`0x${string}`[]> {
  const addresses = await Promise.all(
    Array.from({ length: totalParticipants }, async (_, idx) => {
      try {
        return await publicClient.readContract({
          address: contractAddress,
          abi: roscaAbi,
          functionName: 'participantList',
          args: [BigInt(idx)],
        });
      } catch {
        return undefined;
      }
    })
  );
  return addresses.filter(
    (x): x is `0x${string}` =>
      typeof x === 'string' &&
      x.startsWith('0x') &&
      x.length === 42 &&
      x !== '0x0000000000000000000000000000000000000000'
  );
}

// Fetch a single value from the contract
type FetchContractValueParams = {
  contractAddress: string;
  publicClient: any;
  roscaAbi: Abi;
  functionName: string;
};
export async function fetchContractValue({ contractAddress, publicClient, roscaAbi, functionName }: FetchContractValueParams) {
  return publicClient.readContract({
    address: contractAddress,
    abi: roscaAbi,
    functionName,
  });
}

// Fetch round status (tuple)
export async function fetchRoundStatus({ contractAddress, publicClient, roscaAbi }: Omit<FetchContractValueParams, 'functionName'>) {
  return publicClient.readContract({
    address: contractAddress,
    abi: roscaAbi,
    functionName: 'getCurrentRoundStatus',
  });
}

// Fetch hasContributed for a list of addresses
export async function fetchHasContributedBatch({
  contractAddress,
  publicClient,
  roscaAbi,
  addresses,
}: {
  contractAddress: string;
  publicClient: any;
  roscaAbi: Abi;
  addresses: `0x${string}`[];
}): Promise<boolean[]> {
  return Promise.all(
    addresses.map(async (addr) => {
      try {
        return await publicClient.readContract({
          address: contractAddress,
          abi: roscaAbi,
          functionName: 'hasContributed',
          args: [addr],
        });
      } catch {
        return false;
      }
    })
  );
}

// Fetch all ROSCA details and compute status for the JoinRosca UI
export async function getRoscaDetails({ contractAddress, publicClient, roscaAbi }) {
  // Fetch contract values
  const [totalAmount, contributionAmount, totalParticipants, currentRound] = await Promise.all([
    fetchContractValue({
      contractAddress,
      publicClient,
      roscaAbi,
      functionName: 'totalAmount',
    }),
    fetchContractValue({
      contractAddress,
      publicClient,
      roscaAbi,
      functionName: 'contributionAmount',
    }),
    fetchContractValue({
      contractAddress,
      publicClient,
      roscaAbi,
      functionName: 'totalParticipants',
    }),
    fetchContractValue({
      contractAddress,
      publicClient,
      roscaAbi,
      functionName: 'currentRound',
    }),
  ]);

  // Fetch current participants
  const participants = await fetchParticipants({
    contractAddress,
    totalParticipants: Number(totalParticipants),
    publicClient,
    roscaAbi,
  });

  // Fetch round status
  const roundStatus = await fetchRoundStatus({
    contractAddress,
    publicClient,
    roscaAbi,
  });

  // Check if the last round is distributed
  let isComplete = false;
  if (Number(totalParticipants) > 0) {
    try {
      const lastRound = await publicClient.readContract({
        address: contractAddress,
        abi: roscaAbi,
        functionName: 'rounds',
        args: [BigInt(Number(totalParticipants) - 1)],
      });
      if (lastRound && lastRound[1] === true) {
        isComplete = true;
      }
    } catch (e) {
      // fallback: not complete
    }
  }

  // Compute a user-friendly status string
  let status = 'Active';
  if (isComplete) {
    status = 'Completed';
  } else if (roundStatus.isDistributed) {
    status = 'Distributed';
  } else if (participants.length >= Number(totalParticipants)) {
    status = 'Full';
  }

  return {
    totalAmount: Number(totalAmount) / 1e18,
    contributionAmount: Number(contributionAmount) / 1e18,
    participants: Number(totalParticipants),
    currentParticipants: participants.length,
    status,
  };
}

// Extract a user-friendly revert reason from an error object
export function extractRevertReason(err: any): string {
  // Handle viem/ethers style error objects
  if (err?.cause?.reason) {
    return err.cause.reason;
  }
  // Handle JSON-RPC error with nested data
  if (err?.data?.message) {
    const match = err.data.message.match(/reverted with reason string '([^']+)'/);
    if (match && match[1]) {
      return match[1];
    } else {
      return err.data.message;
    }
  }
  // Handle JSON-RPC error with nested data.error.message
  if (err?.data?.error?.message) {
    const match = err.data.error.message.match(/reverted with reason string '([^']+)'/);
    if (match && match[1]) {
      return match[1];
    } else {
      return err.data.error.message;
    }
  }
  // Handle top-level message
  if (err?.message) {
    const match = err.message.match(/reverted with reason string '([^']+)'/);
    if (match && match[1]) {
      return match[1];
    } else {
      return err.message;
    }
  }
  if (typeof err === 'string') {
    return err;
  }
  return 'Transaction failed.';
}

// Common utility: simulate then send contract transaction
export async function simulateAndSend({
  publicClient,
  walletClient,
  contractAddress,
  abi,
  functionName,
  args = [],
  value,
  chain,
}: {
  publicClient: any,
  walletClient: any,
  contractAddress: string,
  abi: any,
  functionName: string,
  args?: any[],
  value?: bigint,
  chain: any,
}): Promise<{ success: true; hash: string } | { success: false; error: string }> {
  try {
    const [account] = await walletClient.getAddresses();
    // 1. Simulate
    try {
      await publicClient.simulateContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName,
        args,
        value,
        account,
      });
    } catch (simErr: any) {
      return { success: false, error: extractRevertReason(simErr) };
    }
    // 2. Send
    const hash = await walletClient.writeContract({
      account,
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args,
      value,
      chain,
    });
    return { success: true, hash };
  } catch (err: any) {
    return { success: false, error: extractRevertReason(err) };
  }
}

// Contribute to a ROSCA contract and extract user-friendly error
export async function contributeToRosca({
  walletClient,
  publicClient,
  contractAddress,
  contributionAmount,
  roscaAbi,
  chain
}: {
  walletClient: any;
  publicClient: any;
  contractAddress: string;
  contributionAmount: number | string;
  roscaAbi: any;
  chain: any;
}): Promise<{ success: true } | { success: false; error: string }> {
  const value = BigInt(Math.floor(Number(contributionAmount) * 1e18));
  const result = await simulateAndSend({
    publicClient,
    walletClient,
    contractAddress,
    abi: roscaAbi,
    functionName: 'contribute',
    value,
    chain,
  });
  if (result.success) {
    return { success: true };
  } else if (result.success === false) {
    return { success: false, error: result.error };
  } else {
    return { success: false, error: 'Unknown error' };
  }
}

// Claim distribution from a ROSCA contract
export async function claimDistributionToRosca({
  walletClient,
  publicClient,
  contractAddress,
  roscaAbi,
  chain
}: {
  walletClient: any;
  publicClient: any;
  contractAddress: string;
  roscaAbi: any;
  chain: any;
}): Promise<{ success: true } | { success: false; error: string }> {
  const result = await simulateAndSend({
    publicClient,
    walletClient,
    contractAddress,
    abi: roscaAbi,
    functionName: 'distributePool',
    chain,
  });
  if (result.success) {
    return { success: true };
  } else if (result.success === false) {
    return { success: false, error: result.error };
  } else {
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Centralized logic for the blue status note in the dashboard.
 * Handles:
 * - Waiting for participants to join
 * - Waiting for contributions
 * - Waiting for recipient to claim
 * - All other round/user status messages
 */
export function getRoscaStatusNote({
  participants,
  totalParticipants,
  myTurn,
  isDistributed,
  hasContributed,
  recipient,
  userAddress,
}: {
  participants: any[];
  totalParticipants: bigint | number | null;
  myTurn: boolean;
  isDistributed: boolean;
  hasContributed: boolean;
  recipient: string;
  userAddress: string;
}): string {
  // 1. Not all participants have joined
  if (participants.length < Number(totalParticipants)) {
    return 'Waiting for other participants to join the ROSCA...';
  }

  // 2. All participants joined, but not all have contributed
  const allContributed = participants.every((p) => p.status === 'paid');
  if (!allContributed && !isDistributed) {
    if (!hasContributed) {
      return 'Please make your contribution for this round.';
    } else {
      return 'Waiting for other participants to contribute.';
    }
  }

  // 3. All contributed, but recipient hasn't claimed
  if (allContributed && !isDistributed) {
    if (myTurn) {
      return 'It\'s your turn to claim the distribution!';
    } else {
      return 'Waiting for the recipient to claim the distribution...';
    }
  }

  // 4. Round has been distributed
  if (isDistributed) {
    return 'This round has been distributed. Wait for the next round.';
  }

  // Fallback
  return 'Waiting for the next action...';
}

export function isUserTurn(recipient: string, userAddress: string): boolean {
  return (
    typeof recipient === 'string' &&
    typeof userAddress === 'string' &&
    recipient.toLowerCase() === userAddress.toLowerCase()
  );
}
