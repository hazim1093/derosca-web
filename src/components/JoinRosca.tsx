
import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JoinRoscaProps {
  onBack: () => void;
  onJoin: (contractAddress: string) => void;
}

const JoinRosca: React.FC<JoinRoscaProps> = ({ onBack, onJoin }) => {
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roscaDetails, setRoscaDetails] = useState<any>(null);

  const handleSearch = async () => {
    if (!contractAddress) return;
    
    setIsLoading(true);
    // Simulate fetching contract details
    setTimeout(() => {
      setRoscaDetails({
        totalAmount: 1000,
        contributionAmount: 200,
        participants: 5,
        currentParticipants: 3,
        status: 'active'
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleJoin = () => {
    onJoin(contractAddress);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Join Existing ROSCA
            </CardTitle>
            <p className="text-gray-600">Enter the contract address</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Contract Address
              </Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="rounded-xl border-gray-200 focus:border-blue-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!contractAddress || isLoading}
                  variant="outline"
                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-center text-gray-600">
                  Fetching ROSCA details...
                </div>
              </div>
            )}

            {roscaDetails && (
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="text-sm font-medium text-gray-900 mb-2">ROSCA Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Pool:</span>
                    <span className="font-medium">{roscaDetails.totalAmount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Contribution:</span>
                    <span className="font-medium">{roscaDetails.contributionAmount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium">
                      {roscaDetails.currentParticipants}/{roscaDetails.participants}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">
                      {roscaDetails.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {roscaDetails && (
              <Button
                onClick={handleJoin}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl py-3 font-medium transition-all duration-200"
              >
                Register + Contribute {roscaDetails.contributionAmount} ETH
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinRosca;
