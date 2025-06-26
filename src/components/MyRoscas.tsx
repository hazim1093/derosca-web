
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccount, usePublicClient } from 'wagmi';
import { roscaAbi } from '../lib/contracts/roscaContract';
import { getUserRoscaContracts, cacheUserRoscas, getCachedUserRoscas } from '../lib/services/userRoscaService';
import { getRoscaDetails } from '../lib/services/roscaService';

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

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const fetchUserRoscas = async (useCache = true) => {
    if (!address || !isConnected || !publicClient) {
      setLoading(false);
      return;
    }

    setError(null);
    
    try {
      // Try to get cached data first
      let contracts = useCache ? getCachedUserRoscas(address) : null;
      
      if (!contracts) {
        // Fetch from blockchain
        const discoveredContracts = await getUserRoscaContracts({
          userAddress: address,
          publicClient,
          roscaAbi,
        });
        contracts = discoveredContracts;
        
        // Cache the results
        cacheUserRoscas(address, contracts);
      }

      // Fetch details for each contract
      const roscaDetails = await Promise.all(
        contracts.map(async (contract: any) => {
          try {
            const details = await getRoscaDetails({
              contractAddress: contract.contractAddress,
              publicClient,
              roscaAbi,
            });
            return {
              contractAddress: contract.contractAddress,
              ...details,
            };
          } catch (err) {
            console.error(`Error fetching details for ${contract.contractAddress}:`, err);
            return null;
          }
        })
      );

      // Filter out failed requests
      const validRoscas = roscaDetails.filter((rosca): rosca is UserRosca => rosca !== null);
      setRoscas(validRoscas);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your ROSCAs');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
                You haven't joined any ROSCAs with this wallet yet.
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
