import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAccount, usePublicClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { roscaAbi } from '../lib/contracts/rosca.artifacts';
import { useJoinRosca } from '../lib/contracts/roscaContract';
import { getRoscaDetails, extractRevertReason } from '../lib/services/roscaService';
import { getChainById } from '../lib/wagmi';
import { 
  validateEthereumAddress, 
  validateNumericInput, 
  validateNetwork,
  blockchainQueryLimiter,
  isHighValueTransaction
} from '../lib/validation/securityValidation';
import { categorizeError, retryOperation, ErrorCategory } from '../lib/errors/errorHandling';
import TransactionConfirmDialog from './security/TransactionConfirmDialog';

interface JoinRoscaProps {
  onJoin: (contractAddress: string) => void;
}

interface RoscaDetails {
  totalAmount: number;
  contributionAmount: number;
  participants: number;
  currentParticipants: number;
  status: string;
}

const JoinRosca: React.FC<JoinRoscaProps> = ({ onJoin }) => {
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roscaDetails, setRoscaDetails] = useState<RoscaDetails | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { isConnected, address: account, chainId } = useAccount();
  const publicClient = usePublicClient();
  const chain = getChainById(chainId) ?? undefined;
  const { joinRosca } = useJoinRosca(chain);

  const validateInput = (address: string): boolean => {
    const addressValidation = validateEthereumAddress(address);
    if (!addressValidation.isValid) {
      setValidationError(addressValidation.error || 'Invalid address');
      return false;
    }

    // Network validation
    if (chain) {
      const networkValidation = validateNetwork(chainId, chain.id);
      if (!networkValidation.isValid) {
        setValidationError(networkValidation.error || 'Network error');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setContractAddress(address);
    
    // Clear previous errors when user starts typing
    if (validationError && address.length > 0) {
      setValidationError(null);
    }
  };

  const handleSearch = async () => {
    if (!contractAddress) return;

    if (!validateInput(contractAddress)) {
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet to search for ROSCA contracts');
      return;
    }

    // Rate limiting check
    if (!blockchainQueryLimiter.canMakeRequest('search')) {
      const remainingTime = Math.ceil(blockchainQueryLimiter.getRemainingTime('search') / 1000);
      toast.error(`Rate limit exceeded. Please wait ${remainingTime} seconds before searching again.`);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    
    try {
      const details = await retryOperation(async () => {
        return await getRoscaDetails({ 
          contractAddress: contractAddress as `0x${string}`, 
          publicClient, 
          roscaAbi 
        });
      });
      
      setRoscaDetails(details);
      setFetchError(null);
    } catch (err) {
      const enhancedError = categorizeError(err);
      setRoscaDetails(null);
      setFetchError(enhancedError.userFriendly);
      
      // Log detailed error for debugging
      console.error('Search error details:', {
        category: enhancedError.category,
        message: enhancedError.message,
        retryable: enhancedError.retryable
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClick = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to join the ROSCA');
      return;
    }
    if (!roscaDetails) {
      toast.error('No ROSCA details found. Please search for a contract first.');
      return;
    }

    // Validate contribution amount
    const amountValidation = validateNumericInput(roscaDetails.contributionAmount, 0.001, 1000);
    if (!amountValidation.isValid) {
      toast.error(amountValidation.error);
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmJoin = async () => {
    if (!roscaDetails) return;

    // Rate limiting check for transactions
    if (!blockchainQueryLimiter.canMakeRequest('transaction')) {
      const remainingTime = Math.ceil(blockchainQueryLimiter.getRemainingTime('transaction') / 1000);
      toast.error(`Rate limit exceeded. Please wait ${remainingTime} seconds before trying again.`);
      return;
    }

    setIsJoining(true);
    setFetchError(null);
    
    try {
      // Simulation step: check if the transaction would succeed
      const value = BigInt(Math.floor(Number(roscaDetails.contributionAmount) * 1e18));
      try {
        await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: roscaAbi,
          functionName: 'registerParticipant',
          account,
          value,
        });
      } catch (simErr: unknown) {
        const enhancedError = categorizeError(simErr);
        setFetchError(enhancedError.userFriendly);
        setIsJoining(false);
        return;
      }
      
      toast.info('Sending transaction to join ROSCA...');
      await joinRosca(contractAddress, roscaDetails.contributionAmount);
      toast.success('Successfully joined the ROSCA!');
      onJoin(contractAddress);
    } catch (err: unknown) {
      const enhancedError = categorizeError(err);
      setFetchError(enhancedError.userFriendly);
      setRoscaDetails(roscaDetails); // keep details so user can try again
    } finally {
      setIsJoining(false);
    }
  };

  const isHighValue = roscaDetails ? isHighValueTransaction(roscaDetails.contributionAmount) : false;

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Join Existing ROSCA
              </CardTitle>
              <p className="text-muted-foreground">Enter the contract address</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connection Status */}
              {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                  <p className="text-yellow-700 text-sm">
                    ⚠️ Please connect your wallet using the button in the header to continue
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-foreground">
                  Contract Address
                </Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="address"
                      placeholder="0x..."
                      value={contractAddress}
                      onChange={handleAddressChange}
                      className={`rounded-xl border-rose-200 focus:border-rose-400 ${
                        validationError ? 'border-red-300 focus:border-red-400' : ''
                      }`}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!contractAddress || isLoading || !isConnected || !!validationError}
                    variant="outline"
                    className="rounded-xl border-rose-200 hover:bg-rose-50"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Validation Error */}
                {validationError && (
                  <div className="bg-red-100 border border-red-300 p-3 rounded-xl mt-2 flex items-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03-9-9s-9 4.03-9 9 4.03 9 9 9z" /></svg>
                    <span className="text-red-700 text-sm font-medium">{validationError}</span>
                  </div>
                )}
                
                {/* Fetch Error */}
                {fetchError && !validationError && (
                  <div className="bg-red-100 border border-red-300 p-3 rounded-xl mt-2 flex items-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03-9-9s-9 4.03-9 9 4.03 9 9 9z" /></svg>
                    <span className="text-red-700 text-sm font-medium">{fetchError}</span>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="bg-rose-50 p-4 rounded-xl">
                  <div className="text-center text-muted-foreground">
                    Fetching ROSCA details...
                  </div>
                </div>
              )}

              {roscaDetails && (
                <div className="bg-rose-50 p-4 rounded-xl space-y-3">
                  <div className="text-sm font-medium text-foreground mb-2">ROSCA Details</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pool:</span>
                      <span className="font-medium">{roscaDetails.totalAmount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Contribution:</span>
                      <span className="font-medium">{roscaDetails.contributionAmount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium">
                        {roscaDetails.currentParticipants}/{roscaDetails.participants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-rose-600 capitalize">
                        {roscaDetails.status}
                      </span>
                    </div>
                  </div>
                  {roscaDetails.status === 'Completed' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mt-3">
                      <p className="text-yellow-700 text-sm">
                        ⚠️ This ROSCA has been completed. All rounds have finished and distributions have been made.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {roscaDetails && (
                <Button
                  onClick={handleJoinClick}
                  disabled={!isConnected || isJoining || roscaDetails.status === 'Completed'}
                  className="w-full bg-gradient-to-r from-peach-400 to-rose-500 hover:from-peach-500 hover:to-rose-600 text-white rounded-xl py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {roscaDetails.status === 'Completed'
                    ? 'ROSCA Completed - Cannot Join'
                    : isJoining
                      ? 'Joining...'
                      : `Register + Contribute ${roscaDetails.contributionAmount} ETH`
                  }
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Confirmation Dialog */}
      <TransactionConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmJoin}
        title="Confirm ROSCA Registration"
        description="You are about to register and make your initial contribution to this ROSCA. Please review the details carefully."
        amount={roscaDetails?.contributionAmount.toString()}
        isHighValue={isHighValue}
        contractAddress={contractAddress}
      />
    </>
  );
};

export default JoinRosca;
