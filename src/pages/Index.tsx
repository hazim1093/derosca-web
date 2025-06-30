import React, { useState } from 'react';
import { Plus, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/AppHeader';
import CreateRosca from '@/components/CreateRosca';
import JoinRosca from '@/components/JoinRosca';
import MyRoscas from '@/components/MyRoscas';
import RoscaDashboard from '@/components/RoscaDashboard';
import RoscaLogo from '@/components/RoscaLogo';

type AppState = 'landing' | 'create' | 'join' | 'my-roscas' | 'dashboard';

interface RoscaInfo {
  contractAddress: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>('landing');
  const [roscaInfo, setRoscaInfo] = useState<RoscaInfo | null>(null);

  const handleCreateRosca = () => {
    setCurrentView('create');
  };

  const handleJoinRosca = () => {
    setCurrentView('join');
  };

  const handleMyRoscas = () => {
    setCurrentView('my-roscas');
  };

  const handleBack = () => {
    setCurrentView('landing');
    setRoscaInfo(null); // Clear rosca info when going back to landing
  };

  const handleLogoClick = () => {
    setCurrentView('landing');
    setRoscaInfo(null); // Clear rosca info when clicking logo
  };

  const handleRoscaDeployed = (params: { contractAddress: string }) => {
    console.log('ROSCA deployed with params:', params);
    setRoscaInfo(params);
    setCurrentView('dashboard');
  };

  const handleRoscaJoined = (contractAddress: string) => {
    console.log('Joined ROSCA at:', contractAddress);
    setRoscaInfo({ contractAddress });
    setCurrentView('dashboard');
  };

  const handleViewRosca = (contractAddress: string) => {
    console.log('Viewing ROSCA at:', contractAddress);
    setRoscaInfo({ contractAddress });
    setCurrentView('dashboard');
  };

  const handleWalletDisconnected = () => {
    console.log('Wallet disconnected, returning to landing');
    setCurrentView('landing');
    setRoscaInfo(null);
  };

  const getHeaderProps = () => {
    switch (currentView) {
      case 'create':
        return { showBackButton: true, onBack: handleBack, title: 'Create New ROSCA', onLogoClick: handleLogoClick };
      case 'join':
        return { showBackButton: true, onBack: handleBack, title: 'Join Existing ROSCA', onLogoClick: handleLogoClick };
      case 'my-roscas':
        return { showBackButton: true, onBack: handleBack, title: 'My ROSCAs', onLogoClick: handleLogoClick };
      case 'dashboard':
        return { showBackButton: true, onBack: handleBack, title: 'ROSCA Dashboard', onLogoClick: handleLogoClick };
      default:
        return { onLogoClick: handleLogoClick };
    }
  };

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader {...getHeaderProps()} />
        <CreateRosca onDeploy={handleRoscaDeployed} />
      </div>
    );
  }

  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader {...getHeaderProps()} />
        <JoinRosca onJoin={handleRoscaJoined} />
      </div>
    );
  }

  if (currentView === 'my-roscas') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader {...getHeaderProps()} />
        <MyRoscas onBack={handleBack} onViewRosca={handleViewRosca} />
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader {...getHeaderProps()} />
        <RoscaDashboard roscaInfo={roscaInfo} onWalletDisconnected={handleWalletDisconnected} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader {...getHeaderProps()} />

      <div className="flex flex-col items-center justify-center p-4 pt-16 space-y-12">
        {/* Centered ROSCA Logo */}
        <RoscaLogo />

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <Button
            onClick={handleMyRoscas}
            className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Eye className="w-5 h-5 mr-3" />
            My ROSCAs
          </Button>

          <Button
            onClick={handleCreateRosca}
            className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create New ROSCA
          </Button>

          <Button
            onClick={handleJoinRosca}
            variant="outline"
            className="w-full border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <Users className="w-5 h-5 mr-3" />
            Join Existing ROSCA
          </Button>
        </div>

        <div className="pt-8 border-t border-rose-100 max-w-md">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            ROSCA enables groups to save and borrow together in a transparent,
            blockchain-based rotating credit system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
