import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccount, usePublicClient } from 'wagmi';
import { roscaAbi } from '../lib/contracts/rosca.artifacts';
import { getUserRoscaContracts, cacheUserRoscas, getCachedUserRoscas, getRoscaByAddress } from '../lib/services/userRoscaService';

interface MyRoscasProps {
  onBack: () => void;
  onViewRosca: (contractAddress: string) => void;
}

interface UserRosca {
  contractAddress: string;
  totalAmount: number;
  contributionAmount: number;
  participants: number;
  currentParticipants: number;
  status: string;
}

const MyRoscas: React.FC<MyRoscasProps> = ({ onBack, onViewRosca }) => {
  const [roscas, setRoscas] = useState<UserRosca[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractSearch, setContractSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const fetchUserRoscas = async (useCache = true) => {
    if (!address || !isConnected || !publicClient) {
      setLoading(false);
      return;
    }

    setError(null);

    try {
      console.log('Fetching user ROSCAs...');

      // Try to get cached data first
      let contracts = useCache ? getCachedUserRoscas(address) : null;

      if (!contracts) {
        console.log('No cached data, fetching from blockchain...');
        // Fetch from blockchain
        const discoveredContracts = await getUserRoscaContracts({
          userAddress: address,
          publicClient,
          roscaAbi,
        });
        contracts = discoveredContracts;

        // Cache the results
        cacheUserRoscas(address, contracts);
      } else {
        console.log('Using cached ROSCA data');
      }

      // Fetch details for each contract
      const roscaDetails = await Promise.all(
        contracts.map(async (contract: any) => {
          try {
            const details = await getRoscaByAddress({
              contractAddress: contract.contractAddress,
              publicClient,
              roscaAbi,
            });
            return details;
          } catch (err) {
            console.error(`Error fetching details for ${contract.contractAddress}:`, err);
            return null;
          }
        })
      );

      // Filter out failed requests
      const validRoscas = roscaDetails.filter((rosca): rosca is UserRosca => rosca !== null);
      console.log(`Successfully loaded ${validRoscas.length} ROSCAs`);
      setRoscas(validRoscas);
    } catch (err: any) {
      console.error('Error in fetchUserRoscas:', err);
      setError(err.message || 'Failed to fetch your ROSCAs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchByAddress = async () => {
    if (!contractSearch.trim() || !isConnected || !publicClient) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      console.log('Searching for ROSCA by address:', contractSearch);
      const roscaDetails = await getRoscaByAddress({
        contractAddress: contractSearch,
        publicClient,
        roscaAbi,
      });

      // Check if this ROSCA is already in the list
      const existingRosca = roscas.find(r => r.contractAddress === contractSearch);
      if (!existingRosca) {
        setRoscas(prev => [...prev, roscaDetails]);
      }

      setContractSearch('');
    } catch (err: any) {
      console.error('Error searching ROSCA by address:', err);
      setSearchError('Failed to find ROSCA at this address. Please check the address.');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoscas();
  }, [address, isConnected, publicClient]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserRoscas(false); // Don't use cache
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Please connect your wallet to view your ROSCAs</p>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
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
          <Button onClick={onBack} variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My ROSCAs</h1>
          <p className="text-muted-foreground">ROSCAs you've joined with this wallet</p>
        </div>

        {/* Search by Contract Address */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              Search by Contract Address
            </CardTitle>
            <p className="text-sm text-muted-foreground">Add a ROSCA by entering its contract address</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract-search" className="text-sm font-medium text-foreground">
                Contract Address
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="contract-search"
                  placeholder="0x..."
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  className="flex-1 rounded-xl border-rose-200 focus:border-rose-400"
                />
                <Button
                  onClick={handleSearchByAddress}
                  disabled={!contractSearch.trim() || searchLoading}
                  className="bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-xl"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {searchError && (
                <div className="bg-red-100 border border-red-300 p-3 rounded-xl mt-2 flex items-center gap-2 shadow-sm">
                  <span className="text-red-700 text-sm font-medium">{searchError}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">Discovering your ROSCAs...</div>
          </div>
        ) : error ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={() => fetchUserRoscas(false)} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : roscas.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ROSCAs Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't joined any ROSCAs with this wallet yet, or try searching by contract address above.
              </p>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {roscas.map((rosca) => (
              <Card key={rosca.contractAddress} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      ROSCA Contract
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={
                        rosca.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : rosca.status === 'Full'
                          ? 'bg-blue-100 text-blue-800'
                          : rosca.status === 'Completed'
                          ? 'bg-gray-100 text-gray-800'
                          : rosca.status === 'Distributed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {rosca.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">
                    {rosca.contractAddress.slice(0, 10)}...{rosca.contractAddress.slice(-8)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Pool</p>
                      <p className="font-bold text-gray-900">{rosca.totalAmount} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Your Contribution</p>
                      <p className="font-bold text-gray-900">{rosca.contributionAmount} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Participants</p>
                      <p className="font-bold text-gray-900">
                        {rosca.currentParticipants}/{rosca.participants}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-bold text-rose-600 capitalize">{rosca.status}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onViewRosca(rosca.contractAddress)}
                    className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoscas;
