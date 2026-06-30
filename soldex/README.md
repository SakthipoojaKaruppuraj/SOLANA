# SOLDex – Automated Market Maker (AMM) on Solana

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-blueviolet.svg)](https://solana.com)
[![Anchor Framework](https://img.shields.io/badge/Anchor-0.30.1-orange.svg)](https://www.anchor-lang.com)

SOLDex is a constant product Automated Market Maker (AMM) built on the Solana blockchain. It provides a premium, responsive React user interface for token trading, liquidity deposits, and on-chain analytics.

---

## 🚀 Key Features

* **Sleek Swap Engine**: Trade tokens with custom slippage options and real-time exchange rates calculated from on-chain reserves.
* **Liquidity Management**: Atomic dual-token deposit/withdrawal operations, dynamically minting and burning Liquidity Provider (LP) tokens.
* **Dynamic Analytics**: Real-time pools dashboard displaying Total Value Locked (TVL) estimates, reserve sizes, and fee earnings.
* **Advanced Developer Diagnostics**: Dedicated developer tools page (`/dev`) supporting diagnostics health checks, SPL mint initialization, local storage configurations import/export, and on-chain address exploration.
* **Highly Optimized Bundle**: Built with lazy loading, route-based code-splitting, and vendor chunking to keep the main bundle extremely lightweight (< 500 KB).

---

## 📁 Repository Structure

```text
├── programs/
│   └── soldex/                 # Rust Solana smart contract (Anchor framework)
├── tests/
│   └── soldex.ts               # Integration tests for smart contract validation
├── migrations/                 # Deployment scripts for Solana program
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout & reusable UI widgets
│   │   ├── hooks/              # State management React Hooks (useSwap, useLiquidity, usePool...)
│   │   ├── services/           # Solana/Anchor RPC interaction services
│   │   ├── stores/             # Zustand stores (useTokenStore, usePoolStore)
│   │   └── config/             # Config loader with localStorage fallback
│   ├── vite.config.ts          # Bundle optimization & code splitting config
│   └── .env.example            # Environment variables template
├── LICENSE                     # MIT License
├── ARCHITECTURE.md             # In-depth architectural flow & technical details
├── DEPLOYMENT.md               # Guide to Devnet deployment and environment configuration
└── CONTRIBUTING.md             # Developer workflow & contributing guidelines
```

---

## 🛠️ Getting Started

### Prerequisites

* Rust & Cargo (1.75.0+)
* Solana CLI (1.18.0+)
* Anchor CLI (0.30.1+)
* Node.js (v18+) & npm

### Running Locally

#### 1. Compile & Build the Smart Contract

Initialize dependencies and build the Rust program:
```bash
yarn install
anchor build
```

#### 2. Start a Local Solana Test Validator

If you wish to test locally:
```bash
solana-test-validator
```

#### 3. Run the Smart Contract Tests
Ensure local validation compiles correctly:
```bash
anchor test
```

#### 4. Launch the Frontend
Navigate to the `frontend/` directory, set up variables, and launch the Vite development server:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit the application in your browser at `http://localhost:5173` (or the port specified by Vite).

---

## 📖 Additional Guides

* **Detailed Mechanics**: Learn about PDA seeds, constant product formulas, and states in [ARCHITECTURE.md](ARCHITECTURE.md).
* **Deploy to Devnet**: Step-by-step instructions on deploying the Solana program and hosting the frontend in [DEPLOYMENT.md](DEPLOYMENT.md).
* **Contributing Guidelines**: Review our code quality, linting, and PR submission criteria in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
