import React, { useState } from 'react';
import { Users, Eye, Plus, Gift, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { localhostChain } from '@/lib/wagmi';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface RoscaDashboardProps {
  onBack: () => void;
  roscaInfo?: any;
}

const RoscaDashboard: React.FC<RoscaDashboardProps> = ({ onBack, roscaInfo }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const chain = localhostChain; // fallback for now, can be replaced with actual chain context

  const roscaData = {
    totalAmount: 1000,
    contributionAmount: 200,
    participants: 5,
    currentRound: 2,
    nextDistribution: '2024-01-15',
    status: 'active',
    myTurn: false,
    nextTurn: 3
  };

  const participants = [
    { id: 1, address: '0x1234...5678', status: 'paid', turn: 1 },
    { id: 2, address: '0xabcd...efgh', status: 'paid', turn: 2 },
    { id: 3, address: '0x9876...5432', status: 'pending', turn: 3 },
    { id: 4, address: '0xfedc...ba98', status: 'pending', turn: 4 },
    { id: 5, address: '0x1111...2222', status: 'pending', turn: 5 }
  ];

  // Helper to get block explorer URL
  const getExplorerUrl = (address: string) => {
    if (chain && chain.blockExplorers && chain.blockExplorers.default?.url) {
      if (!chain.blockExplorers.default.url) return '';
      return `${chain.blockExplorers.default.url}/address/${address}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active ROSCA
          </Badge>
        </div>

        {/* Permanent contract address card */}
        {roscaInfo?.contractAddress && (
          <Card className="mb-6 border-0 shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="text-xs text-gray-700 font-mono truncate">
                Contract Address:
                <span className="ml-2 break-all font-semibold">{roscaInfo.contractAddress}</span>
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
                      Current network
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(roscaInfo.contractAddress);
                  }}
                >
                  Copy
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={
                          (!getExplorerUrl(roscaInfo.contractAddress)
                            ? 'cursor-not-allowed'
                            : '') + ' ml-2'
                        }
                        tabIndex={-1}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!getExplorerUrl(roscaInfo.contractAddress)}
                          style={!getExplorerUrl(roscaInfo.contractAddress) ? { opacity: 0.5 } : {}}
                        >
                          {getExplorerUrl(roscaInfo.contractAddress) ? (
                            <a
                              href={getExplorerUrl(roscaInfo.contractAddress)}
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
                    {!getExplorerUrl(roscaInfo.contractAddress) && (
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

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pool</p>
                  <p className="text-2xl font-bold text-gray-900">{roscaData.totalAmount} ETH</p>
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
                  <p className="text-2xl font-bold text-gray-900">{roscaData.currentRound}/{roscaData.participants}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{roscaData.contributionAmount} ETH</p>
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
          >
            <Plus className="w-4 h-4 mr-2" />
            Make Contribution
          </Button>
          <Button
            onClick={() => setActiveTab('claim')}
            variant={activeTab === 'claim' ? 'default' : 'outline'}
            className="rounded-xl"
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
            {activeTab === 'status' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Current Round</p>
                    <p className="text-lg font-bold text-gray-900">{roscaData.currentRound}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Next Distribution</p>
                    <p className="text-lg font-bold text-gray-900">{roscaData.nextDistribution}</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                  <p className="text-blue-900 font-medium">
                    {roscaData.myTurn ?
                      "It's your turn to receive the distribution!" :
                      `Participant ${roscaData.nextTurn} is next to receive the distribution.`
                    }
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{participant.address}</p>
                      <p className="text-sm text-gray-600">Turn: {participant.turn}</p>
                    </div>
                    <Badge
                      variant={participant.status === 'paid' ? 'default' : 'secondary'}
                      className={participant.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {participant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contribute' && (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-4">
                  <p className="text-green-900 font-medium mb-2">Ready to contribute?</p>
                  <p className="text-green-700">Amount: {roscaData.contributionAmount} ETH</p>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl px-8 py-3">
                  Submit Contribution
                </Button>
              </div>
            )}

            {activeTab === 'claim' && (
              <div className="text-center py-8">
                {roscaData.myTurn ? (
                  <div>
                    <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl mb-4">
                      <p className="text-purple-900 font-medium mb-2">Distribution Available!</p>
                      <p className="text-purple-700">Amount: {roscaData.totalAmount} ETH</p>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl px-8 py-3">
                      Claim Distribution
                    </Button>
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
      </div>
    </div>
  );
};

export default RoscaDashboard;
