import React, { useState, useEffect } from 'react';
import { Users, Eye, Plus, Gift, ExternalLink, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { localhostChain } from '@/lib/wagmi';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { roscaAbi } from '../lib/contracts/rosca.artifacts';
import { useContributeRosca } from '../lib/contracts/roscaContract';
import { fetchContractValue, fetchRoundStatus, contributeToRosca, claimDistributionToRosca, getRoscaDetails, getRoscaStatusNote, isUserTurn } from '../lib/services/roscaService';
import { shortenAddress, retryWithBackoff } from '../lib/utils';
import { useRoscaParticipants } from '../hooks/useRoscaParticipants';
import { toast } from 'sonner';

interface RoscaDashboardProps {
  roscaInfo?: any;
  onWalletDisconnected?: () => void;
}

const RoscaDashboard: React.FC<RoscaDashboardProps> = ({ roscaInfo, onWalletDisconnected }) => {
  const [activeTab, setActiveTab] = useState('status');
  const chain = localhostChain;
  const contractAddress = roscaInfo?.contractAddress;
  const { address: userAddress, isConnected } = useAccount();
  const walletClient = useWalletClient().data;
  const publicClient = usePublicClient();

  // Monitor wallet connection and redirect when disconnected
  useEffect(() => {
    if (!isConnected && onWalletDisconnected) {
      console.log('Wallet disconnected, redirecting to home...');
      onWalletDisconnected();
    }
  }, [isConnected, onWalletDisconnected]);

  // State for contract data
  const [totalAmount, setTotalAmount] = useState<bigint | null>(null);
  const [contributionAmount, setContributionAmount] = useState<bigint | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<bigint | null>(null);
  const [currentRound, setCurrentRound] = useState<bigint | null>(null);
  const [roundStatusRaw, setRoundStatusRaw] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roscaStatus, setRoscaStatus] = useState<string>('Active');

  // Helper function to fetch contract data
  const fetchContractData = async () => {
    if (!contractAddress || !publicClient) return;

    setLoading(true);
    setError(null);

    try {
      await retryWithBackoff(
        async () => {
          // Fetch backend status and details
          const details = await getRoscaDetails({ contractAddress, publicClient, roscaAbi });
          setTotalAmount(BigInt(Math.floor(details.totalAmount * 1e18)));
          setContributionAmount(BigInt(Math.floor(details.contributionAmount * 1e18)));
          setTotalParticipants(BigInt(details.participants));

          // Fetch contract balance
          const balance = await publicClient.getBalance({ address: contractAddress });
          setContractBalance(balance);

          // Fetch currentRound and roundStatusRaw for rest of UI
          const [currentRoundVal, roundStatusVal] = await Promise.all([
            fetchContractValue({ contractAddress, publicClient, roscaAbi, functionName: 'currentRound' }),
            fetchRoundStatus({ contractAddress, publicClient, roscaAbi })
          ]);
          setCurrentRound(currentRoundVal as bigint);
          setRoundStatusRaw(roundStatusVal);
          setRoscaStatus(details.status);
        },
        2, // maxAttempts: retry once
        2000 // baseDelay: 2 seconds
      );
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contract data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractData();
  }, [contractAddress, publicClient]);

  // Use custom hook for participants
  const [participantsRefreshKey, setParticipantsRefreshKey] = useState(0);
  const { participants, loading: participantsLoading, error: participantsError } = useRoscaParticipants({
    contractAddress,
    totalParticipants,
    publicClient,
    refreshKey: participantsRefreshKey,
  });

  // Destructure roundStatus tuple if available
  let roundNumber, recipient, totalContributed, targetAmount, isDistributed;
  if (roundStatusRaw && Array.isArray(roundStatusRaw)) {
    roundNumber = roundStatusRaw[0];
    recipient = roundStatusRaw[1];
    totalContributed = roundStatusRaw[2];
    targetAmount = roundStatusRaw[3];
    isDistributed = roundStatusRaw[4];
  }

  // Determine myTurn
  const myTurn = isUserTurn(recipient, userAddress);

  // Compute hasContributed for the current user
  const currentUserParticipant = participants.find(
    (p) =>
      typeof p.address === 'string' &&
      typeof userAddress === 'string' &&
      p.address.toLowerCase() === userAddress.toLowerCase()
  );
  const hasContributed = currentUserParticipant?.status === 'paid';

  // Helper to get block explorer URL
  const getExplorerUrl = (address: string) => {
    if (chain && chain.blockExplorers && chain.blockExplorers.default?.url) {
      if (!chain.blockExplorers.default.url) return '';
      return `${chain.blockExplorers.default.url}/address/${address}`;
    }
    return '';
  };

  // Loading state
  const isLoading = loading || participantsLoading;

  // Use new useContributeRosca hook
  const { contributeRosca } = useContributeRosca();
  const [isSubmittingContribution, setIsSubmittingContribution] = useState(false);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const handleSubmitContribution = async () => {
    if (!isConnected || !contractAddress || !contributionAmount || !walletClient || !publicClient) {
      setContributionError('Missing wallet connection or contract info.');
      return;
    }
    setIsSubmittingContribution(true);
    setContributionError(null);
    const result = await contributeToRosca({
      walletClient,
      publicClient,
      contractAddress,
      contributionAmount: Number(contributionAmount) / 1e18,
      roscaAbi,
      chain,
    });
    if (result.success) {
      toast.success('Contribution submitted successfully!');
      await fetchContractData();
      setParticipantsRefreshKey((k) => k + 1);
    } else if (result.success === false) {
      setContributionError(result.error);
    }
    setIsSubmittingContribution(false);
  };

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const handleClaimDistribution = async () => {
    if (!isConnected || !contractAddress || !walletClient || !publicClient) {
      setClaimError('Missing wallet connection or contract info.');
      return;
    }
    setIsClaiming(true);
    setClaimError(null);
    try {
      // Debug: log balances before
      const contractBalanceBefore = await publicClient.getBalance({ address: contractAddress });
      const userBalanceBefore = await publicClient.getBalance({ address: userAddress });
      console.log('Contract balance before:', Number(contractBalanceBefore) / 1e18, 'ETH');
      console.log('User balance before:', Number(userBalanceBefore) / 1e18, 'ETH');

      const result = await claimDistributionToRosca({
        walletClient,
        publicClient,
        contractAddress,
        roscaAbi,
        chain,
      });
      if (result.success) {
        toast.success('Distribution claimed successfully!');
        await fetchContractData();
        setParticipantsRefreshKey((k) => k + 1);
        // Wait for transaction receipt (assume last tx hash is available from walletClient)
        // If you want to get the hash, you may need to update claimDistributionToRosca to return it
        // For now, just refetch balances
      } else if (result.success === false) {
        setClaimError(result.error);
      }

      // Debug: log balances after
      const contractBalanceAfter = await publicClient.getBalance({ address: contractAddress });
      const userBalanceAfter = await publicClient.getBalance({ address: userAddress });
      console.log('Contract balance after:', Number(contractBalanceAfter) / 1e18, 'ETH');
      console.log('User balance after:', Number(userBalanceAfter) / 1e18, 'ETH');
      // Optionally, fetch and log transaction receipt if you have the hash
    } catch (err) {
      setClaimError('Error during claim: ' + (err instanceof Error ? err.message : String(err)));
    }
    setIsClaiming(false);
  };

  // Show wallet disconnection warning if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
                <p className="text-yellow-800 font-medium">⚠️ Wallet Disconnected</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please reconnect your wallet to view ROSCA details
                </p>
              </div>
              {onWalletDisconnected && (
                <Button onClick={onWalletDisconnected} variant="outline">
                  Return to Home
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div></div> {/* Empty div to maintain layout */}
          <Badge
            variant="secondary"
            className={
              roscaStatus === 'Completed'
                ? 'bg-gray-100 text-gray-800'
                : roscaStatus === 'Distributed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }
          >
            {roscaStatus} ROSCA
          </Badge>
        </div>

        {/* Permanent contract address card */}
        {contractAddress && (
          <Card className="mb-6 border-0 shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="text-xs text-gray-700 font-mono truncate">
                Contract Address:
                <span className="ml-2 break-all font-semibold">{contractAddress}</span>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 cursor-default">
                          {chain?.name}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Contract network
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(contractAddress);
                  }}
                >
                  Copy
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={
                          (!getExplorerUrl(contractAddress)
                            ? 'cursor-not-allowed'
                            : '') + ' ml-2'
                        }
                        tabIndex={-1}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!getExplorerUrl(contractAddress)}
                          style={!getExplorerUrl(contractAddress) ? { opacity: 0.5 } : {}}
                        >
                          {getExplorerUrl(contractAddress) ? (
                            <a
                              href={getExplorerUrl(contractAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View on Explorer
                            </a>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View on Explorer
                            </span>
                          )}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!getExplorerUrl(contractAddress) && (
                      <TooltipContent>
                        Block explorer URL not found for this network.
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
              <div className="text-lg text-gray-500">Loading ROSCA data...</div>
              <div className="text-sm text-gray-400">Fetching contract details and participant information</div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Gift className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Pool</p>
                      <p className="text-2xl font-bold text-gray-900">{totalAmount ? Number(totalAmount) / 1e18 : 0} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Round</p>
                      <p className="text-2xl font-bold text-gray-900">{(currentRound ? Number(currentRound) + 1 : 1)}/{totalParticipants?.toString() ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Your Contribution</p>
                      <p className="text-2xl font-bold text-gray-900">{contributionAmount ? Number(contributionAmount) / 1e18 : 0} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contract Balance</p>
                      <p className="text-2xl font-bold text-gray-900">{contractBalance ? Number(contractBalance) / 1e18 : 0} ETH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Button
                onClick={() => setActiveTab('status')}
                variant={activeTab === 'status' ? 'default' : 'outline'}
                className="rounded-xl"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Status
              </Button>
              <Button
                onClick={() => setActiveTab('contribute')}
                variant={activeTab === 'contribute' ? 'default' : 'outline'}
                className="rounded-xl"
                disabled={roscaStatus === 'Completed'}
                style={roscaStatus === 'Completed' ? { opacity: 0.5, pointerEvents: 'none' } : {}}
              >
                <Plus className="w-4 h-4 mr-2" />
                Make Contribution
              </Button>
              <Button
                onClick={() => setActiveTab('claim')}
                variant={activeTab === 'claim' ? 'default' : 'outline'}
                className="rounded-xl"
                disabled={roscaStatus === 'Completed'}
                style={roscaStatus === 'Completed' ? { opacity: 0.5, pointerEvents: 'none' } : {}}
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Distribution
              </Button>
              <Button
                onClick={() => setActiveTab('participants')}
                variant={activeTab === 'participants' ? 'default' : 'outline'}
                className="rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" />
                View Participants
              </Button>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {activeTab === 'status' && 'ROSCA Status'}
                  {activeTab === 'contribute' && 'Make Contribution'}
                  {activeTab === 'claim' && 'Claim Distribution'}
                  {activeTab === 'participants' && 'Participants'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'status' && roundStatusRaw && (
                  <div className="space-y-4">
                    {/* Completion or Action Note */}
                    {roscaStatus === 'Completed' ? (
                      <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                        <p className="text-green-900 font-medium text-lg mb-2">🎉 ROSCA Completed Successfully!</p>
                        <p className="text-green-700">All rounds have been completed and distributions have been made.</p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                        <p className="text-blue-900 font-medium">
                          {getRoscaStatusNote({
                            participants,
                            totalParticipants,
                            myTurn,
                            isDistributed,
                            hasContributed,
                            recipient,
                            userAddress,
                          })}
                        </p>
                      </div>
                    )}
                    {/* Current Round label */}
                    <div className="text-lg font-medium text-gray-700 mb-1">Current Round</div>
                    {/* Only Distributed and Recipient fields in one row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl flex flex-col justify-center">
                        <p className="text-sm text-gray-600 mb-1">Distributed</p>
                        <p className="text-lg font-bold text-gray-900">{isDistributed ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl flex flex-col justify-center">
                        <p className="text-sm text-gray-600 mb-1">Recipient</p>
                        <p className="text-lg font-bold text-gray-900">
                          {shortenAddress(recipient)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'participants' && (
                  <div className="space-y-3">
                    {participantsLoading || typeof totalParticipants !== 'bigint' ? (
                      <div className="text-center text-gray-500 py-8">Loading participants...</div>
                    ) : participantsError ? (
                      <div className="text-center text-red-500 py-8">{participantsError}</div>
                    ) : participants.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No participants found.</div>
                    ) : (
                      participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">
                              {typeof participant.address === 'string' && participant.address.length === 42
                                ? participant.address
                                : ''}
                            </p>
                            <p className="text-sm text-gray-600">Turn: {participant.turn}</p>
                          </div>
                          <Badge
                            variant='secondary'
                            className={participant.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {participant.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'contribute' && (
                  <div className="text-center py-8">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-4">
                      <p className="text-green-900 font-medium mb-2">Ready to contribute?</p>
                      <p className="text-green-700">Amount: {contributionAmount ? Number(contributionAmount) / 1e18 : 0} ETH</p>
                    </div>
                    <Button
                      onClick={handleSubmitContribution}
                      disabled={isSubmittingContribution || !isConnected || roscaStatus === 'Completed'}
                      className="bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-xl px-8 py-3 font-medium transition-all duration-200"
                    >
                      {roscaStatus === 'Completed' ? 'ROSCA Completed' : isSubmittingContribution ? 'Submitting...' : 'Submit Contribution'}
                    </Button>
                    {contributionError && (
                      <div className="mt-4 text-red-600 text-sm font-medium">{contributionError}</div>
                    )}
                  </div>
                )}

                {activeTab === 'claim' && (
                  <div className="text-center py-8">
                    {myTurn ? (
                      <div>
                        <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl mb-4">
                          <p className="text-purple-900 font-medium mb-2">Distribution Available!</p>
                          <p className="text-purple-700">Amount: {totalAmount ? Number(totalAmount) / 1e18 : 0} ETH</p>
                        </div>
                        <Button
                          onClick={handleClaimDistribution}
                          disabled={isClaiming || !isConnected || roscaStatus === 'Completed'}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl px-8 py-3"
                        >
                          {roscaStatus === 'Completed' ? 'ROSCA Completed' : isClaiming ? 'Claiming...' : 'Claim Distribution'}
                        </Button>
                        {claimError && (
                          <div className="mt-4 text-red-600 text-sm font-medium">{claimError}</div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                        <p className="text-gray-600">It's not your turn yet. Please wait for your scheduled distribution.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default RoscaDashboard;
