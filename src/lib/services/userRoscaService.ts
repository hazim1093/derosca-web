
import { Abi } from 'viem';

// Discover ROSCAs that the user has joined by querying ParticipantRegistered events
export async function getUserRoscaContracts({
  userAddress,
  publicClient,
  roscaAbi,
}: {
  userAddress: `0x${string}`;
  publicClient: any;
  roscaAbi: Abi;
}): Promise<{ contractAddress: string; blockNumber: bigint }[]> {
  try {
    // Query ParticipantRegistered events where the user is the participant
    const logs = await publicClient.getLogs({
      event: {
        type: 'event',
        name: 'ParticipantRegistered',
        inputs: [
          { type: 'address', name: 'participant', indexed: true },
        ],
      },
      args: {
        participant: userAddress,
      },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // Extract unique contract addresses
    const contracts = logs.map((log) => ({
      contractAddress: log.address,
      blockNumber: log.blockNumber,
    }));

    // Remove duplicates by contract address
    const uniqueContracts = contracts.filter(
      (contract, index, self) =>
        index === self.findIndex((c) => c.contractAddress === contract.contractAddress)
    );

    return uniqueContracts;
  } catch (error) {
    console.error('Error fetching user ROSCA contracts:', error);
    return [];
  }
}

// Cache user's ROSCAs in localStorage
export function cacheUserRoscas(userAddress: string, contracts: any[]) {
  const cacheKey = `rosca_contracts_${userAddress}`;
  const cacheData = {
    contracts,
    timestamp: Date.now(),
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
}

// Get cached user's ROSCAs from localStorage
export function getCachedUserRoscas(userAddress: string): any[] | null {
  const cacheKey = `rosca_contracts_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return null;
  
  try {
    const { contracts, timestamp } = JSON.parse(cached);
    // Cache is valid for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return contracts;
    }
  } catch (error) {
    console.error('Error parsing cached ROSCAs:', error);
  }
  
  return null;
}
