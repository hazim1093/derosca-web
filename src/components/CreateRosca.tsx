
import React, { useState } from 'react';
import { Users, DollarSign } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContractDeployment, DeployParams } from '../lib/contracts/roscaContract';
import { toast } from 'sonner';

interface CreateRoscaProps {
  onDeploy: (params: RoscaParams) => void;
}

interface RoscaParams {
  numberOfParticipants: number;
  totalAmount: number;
  contributionAmount: number;
  contractAddress: string;
}

const CreateRosca: React.FC<CreateRoscaProps> = ({ onDeploy }) => {
  const [participants, setParticipants] = useState<number>(5);
  const [totalAmount, setTotalAmount] = useState<number>(1); // Start with 1 ETH
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string>('');
  const [deployedAddress, setDeployedAddress] = useState<string>('');

  const { isConnected } = useAccount();
  const { deployContract } = useContractDeployment();

  const contributionAmount = totalAmount / participants;

  const handleDeploy = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      toast.error('Please connect your wallet to continue');
      return;
    }

    setIsDeploying(true);
    setError('');

    try {
      const params: DeployParams = {
        numberOfParticipants: participants,
        totalAmount
      };

      console.log('Deployment parameters:', params);
      console.log('Contribution amount:', totalAmount / participants);

      toast.info('Deploying ROSCA contract...');

      const contractAddress = await deployContract(params);

      setDeployedAddress(contractAddress);
      toast.success(`ROSCA contract deployed successfully at ${contractAddress}`);

      // Call the original onDeploy callback with the contract data and address
      onDeploy({
        numberOfParticipants: participants,
        totalAmount,
        contributionAmount,
        contractAddress
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deployment failed';
      setError(errorMessage);
      toast.error('Failed to deploy contract. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Create New ROSCA
            </CardTitle>
            <p className="text-muted-foreground">Set your ROSCA parameters</p>
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
              <Label htmlFor="participants" className="text-sm font-medium text-foreground">
                Number of Participants
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="participants"
                  type="number"
                  min="2"
                  max="20"
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="pl-10 rounded-xl border-rose-200 focus:border-rose-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Total Pool Amount (ETH)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="pl-10 rounded-xl border-rose-200 focus:border-rose-400"
                />
              </div>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl">
              <div className="text-sm text-muted-foreground mb-2">Summary</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span className="font-medium">{participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pool:</span>
                  <span className="font-medium">{totalAmount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Initial Contribution:</span>
                  <span className="font-medium">{contributionAmount.toFixed(3)} ETH</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {deployedAddress && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
                <p className="text-green-700 text-sm font-medium">Contract Deployed Successfully!</p>
                <p className="text-green-600 text-xs mt-1 break-all">
                  Address: {deployedAddress}
                </p>
              </div>
            )}

            <Button
              onClick={handleDeploy}
              disabled={isDeploying || !isConnected}
              className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-xl py-3 font-medium transition-all duration-200"
            >
              {isDeploying ? 'Deploying Contract...' : 'Deploy Contract + Initial Contribution'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRosca;
