import React, { useState } from 'react';
import { Users, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { useAccount, usePublicClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContractDeployment, DeployParams } from '../lib/contracts/roscaContract';
import { getRoscaDetails } from '../lib/services/roscaService';
import { roscaAbi } from '../lib/contracts/rosca.artifacts';
import { waitForContractState } from '../lib/utils';
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string>('');
  const [deployedAddress, setDeployedAddress] = useState<string>('');
  const [deploymentStep, setDeploymentStep] = useState<'setup' | 'deploying' | 'confirming' | 'success'>('setup');

  const { isConnected } = useAccount();
  const { deployContract } = useContractDeployment();
  const publicClient = usePublicClient();

  const contributionAmount = totalAmount / participants;

  const handleDeploy = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      toast.error('Please connect your wallet to continue');
      return;
    }

    setIsDeploying(true);
    setDeploymentStep('deploying');
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

      // Wait for contract state to be ready
      setDeploymentStep('confirming');
      setIsConfirming(true);
      toast.info('Confirming contract state...');

      await waitForContractState(async () => {
        console.log('Checking contract state...');
        const details = await getRoscaDetails({
          contractAddress,
          publicClient,
          roscaAbi
        });
        console.log('Contract details:', details);
        return details.currentParticipants >= 1;
      });

      setDeploymentStep('success');
      setIsConfirming(false);
      toast.success('Contract ready! Navigating to dashboard...');

      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      setDeploymentStep('setup');
    } finally {
      setIsDeploying(false);
      setIsConfirming(false);
    }
  };

  const renderContent = () => {
    switch (deploymentStep) {
      case 'deploying':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-rose-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deploying Contract</h3>
            <p className="text-gray-600">Please wait while we deploy your ROSCA contract...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        );

      case 'confirming':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirming Contract</h3>
            <p className="text-gray-600">Waiting for contract state to be ready...</p>
            <p className="text-sm text-gray-500 mt-2">This ensures accurate data display</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Ready!</h3>
            <p className="text-gray-600">Your ROSCA contract is ready to use</p>
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl mt-4">
              <p className="text-green-700 text-sm font-medium">Contract Deployed Successfully!</p>
              <p className="text-green-600 text-xs mt-1 break-all">
                Address: {deployedAddress}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <>
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

            <Button
              onClick={handleDeploy}
              disabled={isDeploying || isConfirming || !isConnected}
              className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-xl py-3 font-medium transition-all duration-200"
            >
              {isDeploying || isConfirming ? 'Processing...' : 'Deploy Contract + Initial Contribution'}
            </Button>
          </>
        );
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
            <p className="text-muted-foreground">
              {deploymentStep === 'setup' ? 'Set your ROSCA parameters' :
               deploymentStep === 'deploying' ? 'Deploying your contract' :
               deploymentStep === 'confirming' ? 'Setting up your contract' :
               'Contract ready!'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRosca;
