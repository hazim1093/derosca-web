import { Abi } from 'viem';
import { roscaAbi, roscaBytecode } from '../contracts/rosca.artifacts';

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
    console.log('Searching for ROSCAs for user:', userAddress);

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

    console.log(`Found ${logs.length} ParticipantRegistered events for user`);

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

    console.log(`Found ${uniqueContracts.length} unique ROSCA contracts for user`);
    return uniqueContracts;
  } catch (error) {
    console.error('Error fetching user ROSCA contracts:', error);
    return [];
  }
}

// Get ROSCA details by contract address
export async function getRoscaByAddress({
  contractAddress,
  publicClient,
  roscaAbi,
}: {
  contractAddress: string;
  publicClient: any;
  roscaAbi: Abi;
}): Promise<any> {
  try {
    console.log('Fetching ROSCA details for address:', contractAddress);

    // Import getRoscaDetails from roscaService
    const { getRoscaDetails } = await import('./roscaService');

    const details = await getRoscaDetails({
      contractAddress,
      publicClient,
      roscaAbi,
    });

    console.log('Successfully fetched ROSCA details:', details);
    return {
      contractAddress,
      ...details,
    };
  } catch (error) {
    console.error('Error fetching ROSCA by address:', error);
    throw error;
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
