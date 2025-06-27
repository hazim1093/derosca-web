import { parseEther } from 'viem';
import { useWalletClient, usePublicClient } from 'wagmi';
import { localhostChain } from '../wagmi';
import { roscaAbi, roscaBytecode } from './rosca.artifacts';
import { simulateAndSend } from '../services/roscaService';


// Types for contract interaction
export interface DeployParams {
  numberOfParticipants: number;
  totalAmount: number; // in ETH
}

export interface RoscaContractData {
  totalParticipants: bigint;
  totalAmount: bigint;
  contributionAmount: bigint;
  currentRound: bigint;
  participants: string[];
}

// Deployment function
export const deployRoscaContract = async (
  walletClient: any,
  publicClient: any,
  params: DeployParams
): Promise<string> => {
  try {
    // Get the connected account
    const [account] = await walletClient.getAddresses();

    // Calculate contribution amount (totalAmount / numberOfParticipants)
    const contributionAmount = params.totalAmount / params.numberOfParticipants;

    console.log('Deploying ROSCA contract with params:', {
      numberOfParticipants: params.numberOfParticipants,
      totalAmount: params.totalAmount,
      contributionAmount: contributionAmount,
      account: account
    });

    console.log('Contract args:', [
      BigInt(params.numberOfParticipants),
      parseEther(params.totalAmount.toString())
    ]);
    console.log('Value being sent:', parseEther(contributionAmount.toString()));

    // Deploy the contract
    const hash = await walletClient.deployContract({
      account,
      abi: roscaAbi,
      bytecode: roscaBytecode,
      args: [
        BigInt(params.numberOfParticipants),
        parseEther(params.totalAmount.toString())
      ],
      value: parseEther(contributionAmount.toString()),
    });

    console.log('Deployment transaction hash:', hash);

    // Wait for deployment to complete using public client
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Contract deployed at address:', receipt.contractAddress);

    return receipt.contractAddress!;
  } catch (error) {
    console.error('Error deploying contract:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      data: error.data,
      stack: error.stack
    });
    throw error;
  }
};

// React hook for contract deployment
export const useContractDeployment = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const deployContract = async (params: DeployParams): Promise<string> => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    if (!publicClient) {
      throw new Error('No public client');
    }
    return deployRoscaContract(walletClient, publicClient, params);
  };

  return { deployContract };
};

// React hook for joining an existing ROSCA contract
export const useJoinRosca = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  /**
   * Join a ROSCA contract by calling registerParticipant (payable)
   * @param contractAddress The address of the deployed ROSCA contract
   * @param contributionAmount The amount to contribute (in ETH, as number or string)
   * @returns Transaction hash
   */
  const joinRosca = async (
    contractAddress: string,
    contributionAmount: number | string
  ): Promise<string> => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    if (!publicClient) {
      throw new Error('No public client');
    }
    const value = parseEther(contributionAmount.toString());
    const result = await simulateAndSend({
      publicClient,
      walletClient,
      contractAddress,
      abi: roscaAbi,
      functionName: 'registerParticipant',
      value,
      chain: localhostChain,
    });
    if (result.success) {
      return result.hash;
    } else if (result.success === false) {
      throw new Error(result.error);
    } else {
      throw new Error('Unknown error');
    }
  };

  return { joinRosca };
};

// React hook for contributing to a ROSCA contract
export const useContributeRosca = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  /**
   * Contribute to a ROSCA contract by calling contribute (payable)
   * @param contractAddress The address of the deployed ROSCA contract
   * @param contributionAmount The amount to contribute (in ETH, as number or string)
   * @returns Transaction hash
   */
  const contributeRosca = async (
    contractAddress: string,
    contributionAmount: number | string
  ): Promise<string> => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    if (!publicClient) {
      throw new Error('No public client');
    }
    const value = parseEther(contributionAmount.toString());
    const result = await simulateAndSend({
      publicClient,
      walletClient,
      contractAddress,
      abi: roscaAbi,
      functionName: 'contribute',
      value,
      chain: localhostChain,
    });
    if (result.success) {
      return result.hash;
    } else if (result.success === false) {
      throw new Error(result.error);
    } else {
      throw new Error('Unknown error');
    }
  };

  return { contributeRosca };
};
