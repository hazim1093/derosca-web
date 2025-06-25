import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';

// Create custom localhost chain with explicit Chain ID 31337
export const localhostChain: Chain = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Localhost', url: '' },
  },
};

export const config = getDefaultConfig({
  appName: 'DeROSCA Web',
  projectId: 'ce5a2011ae13e879f141bb159990840d', // DeROSCA Project ID in WalletKit
  chains: [localhostChain], // Use our custom chain with Chain ID 31337
  ssr: false, // Disable SSR for localhost
});
