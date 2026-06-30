# Deployment Guide

This guide walks you through deploying the SOLDex smart contract to Solana Devnet and preparing/building the React frontend for production deployment.

---

## 1. On-Chain Program Deployment

### 1. Configure Solana CLI for Devnet
Set your Solana CLI cluster endpoint to Devnet:
```bash
solana config set --url https://api.devnet.solana.com
```

### 2. Generate a Deployer Keypair (If needed)
Generate a keypair for deployment and get free Devnet SOL via faucet:
```bash
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2 ~/.config/solana/id.json
```
Verify your balance:
```bash
solana balance
```

### 3. Retrieve the Program ID
Build the contract to generate the deploy keypair, then query its address:
```bash
anchor build
solana address -k target/deploy/soldex-keypair.json
```
Example Output: `8KSsmmLyR35acaVM9o9EiQgYyV3PFrGKqzYLCcck8qSH`

### 4. Update Program ID Configurations
Replace the placeholder Program ID with the address generated in the previous step in:
1. **[Anchor.toml](file:///Users/apple/projects/SOLANA/soldex/Anchor.toml)**:
   ```toml
   [programs.devnet]
   soldex = "YOUR_PROGRAM_ID"
   ```
2. **[programs/soldex/src/lib.rs](file:///Users/apple/projects/SOLANA/soldex/programs/soldex/src/lib.rs)**:
   ```rust
   declare_id!("YOUR_PROGRAM_ID");
   ```

Rebuild the program to apply changes:
```bash
anchor build
```

### 5. Deploy to Devnet
Run the deployment command:
```bash
anchor deploy --provider.cluster devnet
```

---

## 2. Frontend Configuration & Deployment

### 1. Environment Settings
Navigate to the `frontend` folder and copy the environment template:
```bash
cd frontend
cp .env.example .env
```

Open `.env` and set the variable values:
* `VITE_SOLANA_RPC_URL`: Set to a public RPC (e.g. `https://api.devnet.solana.com`) or a private RPC node (like Helius or QuickNode).
* `VITE_PROGRAM_ID`: Set to the Program ID deployed in the previous section.

### 2. Build for Production
Run the production build script:
```bash
npm run build
```
This generates optimized HTML, CSS, and JS chunks under the `dist/` directory.

### 3. Deploy to Web Hosting
The production bundle (`dist/` directory) can be uploaded to any static web hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

#### Deploying with Vercel CLI
```bash
npm install -g vercel
vercel --prod
```
Ensure you add `VITE_SOLANA_RPC_URL` and `VITE_PROGRAM_ID` environment variables in your Vercel Dashboard settings.
