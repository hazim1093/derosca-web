
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/ui/connect-button';
import RoscaLogo from '@/components/RoscaLogo';

interface AppHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ showBackButton = false, onBack, title }) => {
  return (
    <header className="w-full bg-white border-b border-rose-100 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left section - Back button or Logo */}
        <div className="flex items-center space-x-4">
          {showBackButton && onBack ? (
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-peach-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ROSCA</h1>
                {title && (
                  <p className="text-sm text-muted-foreground">{title}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right section - Wallet Connection */}
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
