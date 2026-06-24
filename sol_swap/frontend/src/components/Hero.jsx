import React from 'react';
import { ShieldCheck, Zap, Coins } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative py-10 overflow-hidden text-center">
      {/* Background Blurs */}
      <div className="glow-blur-teal left-1/4 -top-20" />
      <div className="glow-blur-blue right-1/4 -top-20" />
      
      <div className="max-w-4xl mx-auto px-4 relative">
        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-800 leading-tight">
          Decentralized Token Swaps on{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Solana
          </span>
        </h1>
        
        <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Swap tokens instantly with sub-second finality and near-zero fees on Solana Devnet. Fully non-custodial and secure.
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-premium text-sm font-semibold text-slate-600">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>Sub-second Speed</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-premium text-sm font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero Slippage Formula</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-premium text-sm font-semibold text-slate-600">
            <Coins className="w-4 h-4 text-primary" />
            <span>Devnet SPL Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
