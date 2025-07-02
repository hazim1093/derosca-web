import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/ui/connect-button';

interface AppHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  onLogoClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showBackButton = false,
  onBack,
  title,
  onLogoClick
}) => {
  return (
    <header className="w-full bg-white border-b border-rose-100 px-4 py-2 md:py-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
        {/* Left section - Back button or Small Logo */}
        <div className="flex items-center space-x-4 justify-center w-full md:w-auto">
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
            <button
              onClick={onLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-peach-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-lg font-bold text-foreground">DeROSCA</h1>
            </button>
          )}
          {title && showBackButton && (
            <div className="border-l border-gray-200 pl-4">
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          )}
        </div>

        {/* Right section - Wallet Connection */}
        <div className="flex items-center justify-center w-full md:w-auto">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
