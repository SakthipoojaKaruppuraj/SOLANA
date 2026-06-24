import React, { useState } from 'react';
import { useSolana } from '../context/SolanaContext';
import { WalletMinimal, Copy, Check, ExternalLink, Wifi, Circle } from 'lucide-react';

const DEVNET_EXPLORER_BASE = 'https://explorer.solana.com/address';

export default function WalletCard() {
  const { isConnected, walletAddress, walletType, balances, networkPing } = useSolana();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncated = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
    : null;

  const pingColor =
    networkPing < 300 ? 'text-emerald-500' :
    networkPing < 700 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="w-full bg-card-custom border border-border-custom rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
          <WalletMinimal className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">Wallet</h3>
          <p className="text-xs text-slate-400">
            {isConnected ? `Connected via ${walletType === 'demo' ? 'Demo (Live Devnet)' : 'Phantom'}` : 'Not connected'}
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-1.5">
          <Circle
            className={`w-2.5 h-2.5 fill-current ${isConnected ? 'text-emerald-500' : 'text-slate-300'}`}
          />
          <span className={`text-xs font-semibold ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {isConnected && walletAddress ? (
        <>
          {/* Address Block */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2">Wallet Address</p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-slate-700 truncate mr-2">
                {truncated}
              </span>
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all duration-150"
                  title="Copy full address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`${DEVNET_EXPLORER_BASE}/${walletAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all duration-150"
                  title="View on Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-slate-400 px-1">Token Balances</p>

            {[
              { symbol: 'SOL', value: balances.sol, color: 'bg-gradient-to-tr from-violet-500 to-purple-400', textColor: 'text-violet-600' },
              { symbol: 'INI', value: balances.ini, color: 'bg-gradient-to-tr from-primary to-blue-400', textColor: 'text-primary' },
              { symbol: 'ADHEE', value: balances.adhee, color: 'bg-gradient-to-tr from-secondary to-teal-400', textColor: 'text-secondary' },
            ].map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 transition-all duration-150"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg ${token.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {token.symbol.slice(0, 1)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{token.symbol}</span>
                </div>
                <span className={`text-sm font-bold font-display ${token.textColor}`}>
                  {token.value !== null
                    ? token.value.toLocaleString(undefined, { maximumFractionDigits: 4 })
                    : <span className="text-slate-300 animate-pulse">loading...</span>
                  }
                </span>
              </div>
            ))}
          </div>

          {/* Network Status */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-xs font-semibold text-slate-400 mb-2">Network Status</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[11px] text-slate-400">Network</p>
                <p className="text-xs font-bold text-slate-700">Devnet</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">RPC Ping</p>
                <p className={`text-xs font-bold ${pingColor}`}>
                  {networkPing > 0 ? `${networkPing}ms` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Status</p>
                <div className="flex items-center justify-center space-x-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-emerald-600">Live</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Not Connected Placeholder */
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <WalletMinimal className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">No wallet connected</p>
          <p className="text-xs text-slate-300 mt-1">Connect a wallet to view your balances</p>
          <div className="mt-4 flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <Wifi className="w-4 h-4 text-slate-300" />
            <span className="text-xs text-slate-400 font-semibold">Solana Devnet</span>
          </div>
        </div>
      )}
    </div>
  );
}
