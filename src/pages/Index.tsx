
import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoscaLogo from '@/components/RoscaLogo';
import CreateRosca from '@/components/CreateRosca';
import JoinRosca from '@/components/JoinRosca';
import RoscaDashboard from '@/components/RoscaDashboard';

type AppState = 'landing' | 'create' | 'join' | 'dashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>('landing');

  const handleCreateRosca = () => {
    setCurrentView('create');
  };

  const handleJoinRosca = () => {
    setCurrentView('join');
  };

  const handleBack = () => {
    setCurrentView('landing');
  };

  const handleRoscaDeployed = (params: any) => {
    console.log('ROSCA deployed with params:', params);
    setCurrentView('dashboard');
  };

  const handleRoscaJoined = (contractAddress: string) => {
    console.log('Joined ROSCA at:', contractAddress);
    setCurrentView('dashboard');
  };

  if (currentView === 'create') {
    return <CreateRosca onBack={handleBack} onDeploy={handleRoscaDeployed} />;
  }

  if (currentView === 'join') {
    return <JoinRosca onBack={handleBack} onJoin={handleRoscaJoined} />;
  }

  if (currentView === 'dashboard') {
    return <RoscaDashboard onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <RoscaLogo />
        
        <div className="space-y-4">
          <Button
            onClick={handleCreateRosca}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create New ROSCA
          </Button>
          
          <Button
            onClick={handleJoinRosca}
            variant="outline"
            className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <Users className="w-5 h-5 mr-3" />
            Join Existing ROSCA
          </Button>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 leading-relaxed">
            ROSCA enables groups to save and borrow together in a transparent, 
            blockchain-based rotating credit system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
