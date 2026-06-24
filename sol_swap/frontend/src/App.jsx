import { SolanaProvider } from './context/SolanaContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SwapCard from './components/SwapCard';
import LiquidityCard from './components/LiquidityCard';
import PoolOverview from './components/PoolOverview';
import WalletCard from './components/WalletCard';
import TransactionTable from './components/TransactionTable';
import './App.css';

function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
        {/* Decorative blobs */}
        <div className="glow-blur-teal -left-32 top-32 pointer-events-none" />
        <div className="glow-blur-blue right-0 top-10 pointer-events-none" />

        {/* Hero */}
        <Hero />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Swap + Liquidity */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <SwapCard />
            <LiquidityCard />
          </div>

          {/* Right Column: Pool + Wallet + Transactions */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Top row: Pool + Wallet side-by-side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PoolOverview />
              <WalletCard />
            </div>

            {/* Transaction Activity full-width */}
            <TransactionTable />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-500">SOL SWAP</span>
          </div>
          <p className="text-xs text-slate-400">
            Running on <span className="font-semibold text-secondary">Solana Devnet</span> · Constant Product AMM · Non-Custodial
          </p>
          <p className="text-xs text-slate-300">For educational use only</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SolanaProvider>
      <Dashboard />
    </SolanaProvider>
  );
}
