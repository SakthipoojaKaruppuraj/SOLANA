import React, { useEffect } from "react";
import { usePoolStore } from "../stores/usePoolStore";
import { usePool } from "../hooks/usePool";
import { useWallet } from "../hooks/useWallet";
import { ChartBarIcon, CurrencyDollarIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";

export const AnalyticsPage: React.FC = () => {
  const { connected } = useWallet();
  const { pools } = usePoolStore();
  const { refreshAll, loading } = usePool();

  useEffect(() => {
    if (connected) {
      refreshAll();
    }
  }, [connected, refreshAll]);

  // Compute stats based on loaded pools
  const tvl = pools.reduce((acc, pool) => {
    // A simplified pricing assuming $1 per token for display purposes
    return acc + (pool.reserveA + pool.reserveB) / 10 ** 9;
  }, 0);

  const accumulatedFees = pools.reduce((acc, pool) => {
    // 0.30% fee on reserves growth estimate (mocked or estimated)
    return acc + ((pool.reserveA + pool.reserveB) / 10 ** 9) * 0.003;
  }, 0);

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-500">Real-time protocol statistics and liquidity reserves.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-card-border rounded-custom shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-primary rounded-xl">
            <CurrencyDollarIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Total Pool Reserves (USD eq.)</div>
            <div className="text-2xl font-bold text-slate-800">${tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-green-500 font-semibold mt-0.5">↑ Live from Devnet</div>
          </div>
        </div>

        <div className="p-6 bg-white border border-card-border rounded-custom shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-secondary rounded-xl">
            <ChartBarIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Active Pools</div>
            <div className="text-2xl font-bold text-slate-800">{pools.length}</div>
            <div className="text-xs text-green-500 font-semibold mt-0.5">Healthy Status</div>
          </div>
        </div>

        <div className="p-6 bg-white border border-card-border rounded-custom shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <PresentationChartLineIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Estimated Fees Generated</div>
            <div className="text-2xl font-bold text-slate-800">${accumulatedFees.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
            <div className="text-xs text-emerald-500 font-semibold mt-0.5">0.30% fee rate</div>
          </div>
        </div>
      </div>

      {/* Pools Table */}
      <div className="bg-white border border-card-border rounded-custom shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Trading Pools</h2>
          {loading && <span className="text-xs text-slate-400">Loading reserves...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-card-border">
                <th className="px-6 py-3">Pool Pair & Address</th>
                <th className="px-6 py-3 text-right">Reserve A (SDXA)</th>
                <th className="px-6 py-3 text-right">Reserve B (SDXB)</th>
                <th className="px-6 py-3 text-right">Total LP Supply</th>
                <th className="px-6 py-3 text-right">Fee Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-sm text-slate-600">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-24 mb-1.5"></div>
                      <div className="h-3 bg-slate-100 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : pools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {!connected ? "Please connect your wallet to fetch pool stats." : "No active liquidity pools found on Devnet."}
                  </td>
                </tr>
              ) : (
                pools.map((pool) => (
                  <tr key={pool.address} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>SDXA - SDXB</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{pool.address}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(pool.reserveA / 10 ** 9).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(pool.reserveB / 10 ** 9).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(pool.totalLpSupply / 10 ** 9).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                      {(pool.feeBps / 100).toFixed(2)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
