# DeROSCA dApp

A decentralized application (dApp) for [DeROSCA](https://github.com/hazim1093/DeROSCA).

DeROSCA is a decentralized ROSCA (Rotating Savings and Credit Association) protocol on Ethereum. This dApp allows users to create, join, and manage ROSCAs in a trustless, transparent, and decentralized way, leveraging smart contracts for security and automation.

## Features

- Create a new ROSCA group on-chain
- Join existing decentralized ROSCAs
- Dashboard to view your ROSCAs and participation status
- Ethereum wallet connection (Web3-enabled)
- Real-time notifications (contributions, pool distribution, etc.)
- Transparent, on-chain status and history

## Supported Networks

- Localhost (default for development)
- Ethereum Mainnet
- Sepolia Testnet
- Arbitrum One

The app will automatically use the network selected in your wallet (e.g., MetaMask). You can deploy and interact with contracts on any of the supported networks.

## Backend

This dApp interacts with the [DeROSCA smart contract backend](https://github.com/hazim1093/DeROSCA).
See the backend repo for contract details, deployment, and security info.

## Usage

1. Connect your Ethereum wallet to the dApp.
2. Create a new ROSCA or join an existing decentralized ROSCA group.
3. Contribute funds and participate in automated rounds.
4. Track your status and receive payouts automatically via smart contract.

## Development

### Project info

The project was "vibe-coded" using Lovable and Cursor.

**Lovable Project URL:** https://lovable.dev/projects/3c391189-ba5e-4301-a9f9-08db19e40502

### Prerequisites

- Node.js & npm

### Setup

```sh
# Step 1: Clone the repository
git clone <this-repo-url>
cd derosca-web

# Step 2: Install dependencies
npm install

# Step 3: Start the development server
npm run dev
```

## Technologies

- Lovable Stack
  - Vite
  - TypeScript
  - React
  - shadcn-ui
  - Tailwind CSS
  - React Query
- **viem** (Ethereum smart contract interaction)

## Deployment

You can deploy and share this project directly from [Lovable](https://lovable.dev/projects/3c391189-ba5e-4301-a9f9-08db19e40502) by clicking Share → Publish.

## License

MIT

---

**For more on the smart contract and protocol, see [DeROSCA backend](https://github.com/hazim1093/DeROSCA).**
