
import React, { useState } from 'react';
import { ArrowLeft, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateRoscaProps {
  onBack: () => void;
  onDeploy: (params: RoscaParams) => void;
}

interface RoscaParams {
  numberOfParticipants: number;
  totalAmount: number;
  contributionAmount: number;
}

const CreateRosca: React.FC<CreateRoscaProps> = ({ onBack, onDeploy }) => {
  const [participants, setParticipants] = useState<number>(5);
  const [totalAmount, setTotalAmount] = useState<number>(1000);
  const [isDeploying, setIsDeploying] = useState(false);

  const contributionAmount = totalAmount / participants;

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate contract deployment
    setTimeout(() => {
      onDeploy({
        numberOfParticipants: participants,
        totalAmount,
        contributionAmount
      });
      setIsDeploying(false);
    }, 2000);
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
              Create New ROSCA
            </CardTitle>
            <p className="text-muted-foreground">Set your ROSCA parameters</p>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  min="1"
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
                  <span>Per Contribution:</span>
                  <span className="font-medium">{contributionAmount.toFixed(3)} ETH</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
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
