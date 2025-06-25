import { Abi } from 'viem';

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
