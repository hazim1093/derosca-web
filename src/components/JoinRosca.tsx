
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Join Existing ROSCA
            </CardTitle>
            <p className="text-muted-foreground">Enter the contract address</p>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="rounded-xl border-rose-200 focus:border-rose-400"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!contractAddress || isLoading}
                  variant="outline"
                  className="rounded-xl border-rose-200 hover:bg-rose-50"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
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
              </div>
            )}

            {roscaDetails && (
              <Button
                onClick={handleJoin}
                className="w-full bg-gradient-to-r from-peach-400 to-rose-500 hover:from-peach-500 hover:to-rose-600 text-white rounded-xl py-3 font-medium transition-all duration-200"
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
