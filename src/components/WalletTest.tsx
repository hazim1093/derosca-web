import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

const WalletTest: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Wallet Connection Test</h2>

      <div className="space-y-2">
        <ConnectButton />

        {isConnected && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800">
                ✅ Connected! Address: {address}
              </p>
            </div>
            <Button
              onClick={() => disconnect()}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Please connect your wallet to test
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletTest;
