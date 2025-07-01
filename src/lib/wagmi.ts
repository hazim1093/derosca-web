import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain, mainnet, sepolia, arbitrum } from 'wagmi/chains';

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

export const supportedChains = [localhostChain as any, sepolia, arbitrum, mainnet];

export function getChainById(chainId: number | undefined): Chain | undefined {
  return supportedChains.find((c) => c.id === chainId);
}

export const config = getDefaultConfig({
  appName: 'DeROSCA Web',
  projectId: 'ce5a2011ae13e879f141bb159990840d', // DeROSCA Project ID in WalletKit
  chains: supportedChains as any, // Now supports localhost, sepolia, arbitrum, mainnet
  ssr: false, // Disable SSR for localhost
});
