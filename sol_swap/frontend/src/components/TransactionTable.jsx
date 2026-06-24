import React from 'react';
import { useSolana } from '../context/SolanaContext';
import { Activity, ExternalLink, ArrowRight, Droplets, Clock } from 'lucide-react';

export default function TransactionTable() {
  const { recentTransactions } = useSolana();

  return (
    <div className="w-full bg-card-custom border border-border-custom rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">Transaction Activity</h3>
            <p className="text-xs text-slate-400">Recent swaps and liquidity additions</p>
          </div>
        </div>
        {recentTransactions.length > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
            {recentTransactions.length} {recentTransactions.length === 1 ? 'tx' : 'txs'}
          </span>
        )}
      </div>

      {recentTransactions.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">No transactions yet</p>
          <p className="text-xs text-slate-300 mt-1">Your recent swaps and liquidity additions will appear here</p>
        </div>
      ) : (
        /* Transaction Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold text-slate-400">Type</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-400">Pair</th>
                <th className="pb-3 text-right text-xs font-semibold text-slate-400">Amount In</th>
                <th className="pb-3 text-right text-xs font-semibold text-slate-400">Amount Out</th>
                <th className="pb-3 text-right text-xs font-semibold text-slate-400">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className="group hover:bg-slate-50/60 transition-colors duration-100"
                  style={{ animation: `slide-up 0.3s ease-out ${index * 0.05}s both` }}
                >
                  {/* Type Badge */}
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        tx.type === 'swap'
                          ? 'bg-primary-light text-primary border-primary/10'
                          : 'bg-secondary-light text-secondary border-secondary/10'
                      }`}
                    >
                      {tx.type === 'swap'
                        ? <ArrowRight className="w-3 h-3" />
                        : <Droplets className="w-3 h-3" />
                      }
                      <span>{tx.type === 'swap' ? 'Swap' : 'Liquidity'}</span>
                    </span>
                  </td>

                  {/* Pair */}
                  <td className="py-3 pr-3">
                    <span className="text-xs font-semibold text-slate-600 font-mono">
                      {tx.pair}
                    </span>
                  </td>

                  {/* Amount In */}
                  <td className="py-3 pr-3 text-right">
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {tx.amountIn}
                    </span>
                  </td>

                  {/* Amount Out */}
                  <td className="py-3 pr-3 text-right">
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      {tx.amountOut}
                    </span>
                  </td>

                  {/* Signature */}
                  <td className="py-3 text-right">
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors font-mono group-hover:underline"
                    >
                      <span>{tx.signature.slice(0, 6)}...{tx.signature.slice(-4)}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
