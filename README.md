# DeROSCA Web

A web interface for [DeROSCA](https://github.com/hazim1093/DeROSCA)

A decentralized ROSCA (Rotating Savings and Credit Association) smart contract on Ethereum. This app allows users to create, join, and manage ROSCAs in a trustless, transparent, and decentralized way.

## Features

- Create a new ROSCA group
- Join existing ROSCAs
- Dashboard to view your ROSCAs and participation status
- Wallet connection (Ethereum)
- Real-time notifications (contributions, pool distribution, etc.)
- Transparent on-chain status

## Backend

This app interacts with the [DeROSCA smart contract backend](https://github.com/hazim1093/DeROSCA).
See the backend repo for contract details, deployment, and security info.

## Usage

1. Connect your Ethereum wallet.
2. Create a new ROSCA or join an existing one.
3. Contribute funds and participate in rounds.
4. Track your status and receive payouts automatically.

## Development


### Project info

The project was "vibe-coded" using Lovable and Cursor.

**URL**: https://lovable.dev/projects/3c391189-ba5e-4301-a9f9-08db19e40502

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
- **viem** (Ethereum interaction)

## Deployment

You can deploy and share this project directly from [Lovable](https://lovable.dev/projects/3c391189-ba5e-4301-a9f9-08db19e40502) by clicking Share → Publish.

## License

MIT

---

**For more on the smart contract and protocol, see [DeROSCA backend](https://github.com/hazim1093/DeROSCA).**
