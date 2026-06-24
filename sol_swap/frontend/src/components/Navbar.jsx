import React, { useState } from 'react';
import { useSolana } from '../context/SolanaContext';
import { Wallet, LogOut, Copy, Check, ChevronDown, Activity, Globe } from 'lucide-react';

export default function Navbar() {
  const { isConnected, isConnecting, walletAddress, walletType, connectWallet, disconnectWallet } = useSolana();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 transform transition-transform group-hover:scale-105 duration-300">
              <svg className="w-5 h-5 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight gradient-text-primary">
              SOL SWAP
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            
            {/* Solana Devnet Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 h-9 bg-slate-100 rounded-full border border-slate-200/50 text-xs font-semibold text-slate-600">
              <Globe className="w-3.5 h-3.5 text-secondary animate-spin-slow" />
              <span>Solana Devnet</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* Wallet Connector */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-4 h-10 rounded-xl bg-white border border-slate-200 shadow-premium hover:shadow-premium-hover transition-all duration-200 text-sm font-semibold text-slate-700"
                >
                  <div className={`w-2 h-2 rounded-full ${walletType === 'demo' ? 'bg-secondary' : 'bg-primary'}`} />
                  <span>{truncatedAddress}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-100 shadow-xl py-1 z-50 animate-slide-up">
                    <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-400">
                      CONNECTED ({walletType === 'demo' ? 'DEMO WALLET' : 'PHANTOM'})
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copied ? 'Copied' : 'Copy Address'}</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-5 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transform hover:-translate-y-[1px] active:translate-y-0 transition-all duration-150 disabled:opacity-75 disabled:cursor-wait"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Wallet Selector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 relative animate-slide-up">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span>Connect a Wallet</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-3">
              
              {/* Option 1: Live Demo Wallet */}
              <button
                onClick={() => {
                  connectWallet('demo');
                  setShowModal(false);
                }}
                className="w-full group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-secondary hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary-light flex items-center justify-center text-secondary transform group-hover:scale-105 transition-transform duration-200">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-sm">Demo Wallet (Live Devnet)</div>
                    <div className="text-xs text-slate-400">Pulls real on-chain assets of CLI wallet</div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-secondary-light text-[10px] font-bold text-secondary">
                  RECOMMENDED
                </div>
              </button>

              {/* Option 2: Phantom Wallet */}
              <button
                onClick={() => {
                  connectWallet('phantom');
                  setShowModal(false);
                }}
                className="w-full group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:bg-white hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center text-primary transform group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 text-sm">Phantom Wallet</div>
                    <div className="text-xs text-slate-400">Connect using Phantom Browser Extension</div>
                  </div>
                </div>
                <div className="text-slate-300 font-semibold group-hover:text-primary transition-colors">
                  ➔
                </div>
              </button>
            </div>

            <div className="mt-5 text-center">
              <span className="text-[11px] text-slate-400">
                By connecting a wallet, you agree to our Terms of Service.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
