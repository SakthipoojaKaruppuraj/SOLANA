import React from 'react';
import { useSolana } from '../context/SolanaContext';
import { BarChart3, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

const INI_VAULT = 'Hj8JLixzBs7T13SAB44eLaehLeV5f4pX6ccLCVt1qiag';
const ADHEE_VAULT = 'ASWCDej67vfUpTSmo4toKBVET83tWZQaqASzcocfiYd9';

function StatCard({ label, value, subValue, color, isLoading }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-premium transition-all duration-200">
      <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
      {isLoading ? (
        <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse" />
      ) : (
        <p className={`text-xl font-display font-bold ${color || 'text-slate-800'}`}>{value}</p>
      )}
      {subValue && <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">{subValue}</p>}
    </div>
  );
}

export default function PoolOverview() {
  const { reserves, isLoadingReserves, refreshReserves } = useSolana();

  const totalLiquidity = reserves.ini + reserves.adhee;
  const poolRatio = reserves.ini > 0 ? (reserves.adhee / reserves.ini).toFixed(4) : '—';

  return (
    <div className="w-full bg-card-custom border border-border-custom rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">Pool Overview</h3>
            <p className="text-xs text-slate-400">INI / ADHEE Constant Product Pool</p>
          </div>
        </div>
        <button
          onClick={refreshReserves}
          disabled={isLoadingReserves}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition-all duration-200"
          title="Refresh pool data from Devnet"
        >
          {isLoadingReserves
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <RefreshCw className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          label="INI Reserve"
          value={isLoadingReserves ? '—' : `${reserves.ini.toLocaleString()} INI`}
          subValue={`Vault: ${INI_VAULT.slice(0, 8)}...`}
          color="text-primary"
          isLoading={isLoadingReserves}
        />
        <StatCard
          label="ADHEE Reserve"
          value={isLoadingReserves ? '—' : `${reserves.adhee.toLocaleString()} ADHEE`}
          subValue={`Vault: ${ADHEE_VAULT.slice(0, 8)}...`}
          color="text-secondary"
          isLoading={isLoadingReserves}
        />
        <StatCard
          label="Total Liquidity"
          value={isLoadingReserves ? '—' : `${totalLiquidity.toFixed(2)} tokens`}
          color="text-slate-800"
          isLoading={isLoadingReserves}
        />
        <StatCard
          label="Constant Product (K)"
          value={isLoadingReserves ? '—' : reserves.k.toLocaleString()}
          subValue="x · y = k"
          color="text-violet-600"
          isLoading={isLoadingReserves}
        />
      </div>

      {/* Pool Ratio Bar */}
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-500">Pool Composition</span>
          <span className="text-xs font-semibold text-slate-400">
            1 INI = {poolRatio} ADHEE
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
          {totalLiquidity > 0 && (
            <>
              <div
                className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-l-full transition-all duration-500"
                style={{ width: `${(reserves.ini / totalLiquidity) * 100}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-secondary to-teal-400 rounded-r-full transition-all duration-500"
                style={{ width: `${(reserves.adhee / totalLiquidity) * 100}%` }}
              />
            </>
          )}
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-semibold">
          <span className="text-primary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            INI {totalLiquidity > 0 ? `${((reserves.ini / totalLiquidity) * 100).toFixed(1)}%` : ''}
          </span>
          <span className="text-secondary flex items-center gap-1">
            ADHEE {totalLiquidity > 0 ? `${((reserves.adhee / totalLiquidity) * 100).toFixed(1)}%` : ''}
            <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
          </span>
        </div>
      </div>

      {/* Vault Links */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://explorer.solana.com/address/${INI_VAULT}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 p-2.5 text-xs font-semibold text-primary bg-primary-light hover:bg-primary/10 border border-primary/10 rounded-xl transition-colors group"
        >
          <span>INI Vault</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
        </a>
        <a
          href={`https://explorer.solana.com/address/${ADHEE_VAULT}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 p-2.5 text-xs font-semibold text-secondary bg-secondary-light hover:bg-secondary/10 border border-secondary/10 rounded-xl transition-colors group"
        >
          <span>ADHEE Vault</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
        </a>
      </div>
    </div>
  );
}
