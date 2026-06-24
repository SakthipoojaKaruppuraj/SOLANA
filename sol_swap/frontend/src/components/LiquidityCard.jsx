import React, { useState, useEffect } from 'react';
import { useSolana } from '../context/SolanaContext';
import { Droplets, CheckCircle2, ExternalLink, Loader2, Info } from 'lucide-react';

export default function LiquidityCard() {
  const { isConnected, balances, reserves, executeAddLiquidity } = useSolana();

  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txSig, setTxSig] = useState('');

  // Auto-calculate Token B ratio when Token A changes
  useEffect(() => {
    const numA = parseFloat(amountA);
    if (!amountA || isNaN(numA) || numA <= 0) {
      setAmountB('');
      return;
    }
    if (reserves.ini > 0 && reserves.adhee > 0) {
      const ratio = reserves.adhee / reserves.ini;
      setAmountB((numA * ratio).toFixed(6));
    }
  }, [amountA, reserves]);

  const handleAdd = async () => {
    if (!amountA || !amountB) return;
    setIsAdding(true);
    try {
      const sig = await executeAddLiquidity(amountA, amountB);
      setTxSig(sig);
      setTxSuccess(true);
      setAmountA('');
      setAmountB('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const poolShare =
    reserves.ini > 0 && parseFloat(amountA) > 0
      ? ((parseFloat(amountA) / (reserves.ini + parseFloat(amountA))) * 100).toFixed(3)
      : '0.000';

  const isButtonDisabled =
    isAdding ||
    !amountA ||
    !amountB ||
    parseFloat(amountA) <= 0 ||
    parseFloat(amountA) > (balances.ini || 0) ||
    parseFloat(amountB) > (balances.adhee || 0);

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isAdding) return 'Adding Liquidity...';
    if (!amountA || !amountB) return 'Enter an Amount';
    if (parseFloat(amountA) > (balances.ini || 0)) return 'Insufficient INI Balance';
    if (parseFloat(amountB) > (balances.adhee || 0)) return 'Insufficient ADHEE Balance';
    return 'Add Liquidity';
  };

  return (
    <div className="w-full bg-card-custom border border-border-custom rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 relative">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-secondary-light flex items-center justify-center">
          <Droplets className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">Add Liquidity</h3>
          <p className="text-xs text-slate-400">Deposit tokens into the INI/ADHEE pool</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-2 p-3 rounded-xl bg-primary-light/50 border border-primary/10 mb-5">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary font-medium leading-relaxed">
          Token B amount is auto-calculated to match the current pool ratio ({(reserves.adhee / Math.max(reserves.ini, 0.001)).toFixed(4)} ADHEE per INI).
        </p>
      </div>

      {/* Token A Input */}
      <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl input-field-focus mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-400">Token A</span>
          <span className="text-xs font-semibold text-slate-500">
            Balance: <span className="font-bold text-slate-700">{isConnected ? (balances.ini ?? '--') : '--'}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            disabled={!isConnected}
            className="w-2/3 bg-transparent text-2xl font-display font-bold outline-none text-slate-800 placeholder-slate-300 disabled:cursor-not-allowed"
          />
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="font-display font-bold text-sm text-slate-800">INI</span>
          </div>
        </div>
        {isConnected && (balances.ini || 0) > 0 && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setAmountA((balances.ini || 0).toString())}
              className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors"
            >
              MAX
            </button>
          </div>
        )}
      </div>

      {/* Plus Divider */}
      <div className="flex items-center justify-center my-1">
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm">
          +
        </div>
      </div>

      {/* Token B Input */}
      <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-400">Token B (auto-calculated)</span>
          <span className="text-xs font-semibold text-slate-500">
            Balance: <span className="font-bold text-slate-700">{isConnected ? (balances.adhee ?? '--') : '--'}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={amountB}
            className="w-2/3 bg-transparent text-2xl font-display font-bold outline-none text-slate-800 placeholder-slate-300"
          />
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="font-display font-bold text-sm text-slate-800">ADHEE</span>
          </div>
        </div>
      </div>

      {/* Pool Share Preview */}
      {parseFloat(amountA) > 0 && (
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-500 animate-slide-up">
          <div className="flex justify-between">
            <span>Your Pool Share</span>
            <span className="font-bold text-slate-700">{poolShare}%</span>
          </div>
          <div className="flex justify-between">
            <span>INI Deposited</span>
            <span className="font-bold text-slate-700">{parseFloat(amountA).toFixed(4)} INI</span>
          </div>
          <div className="flex justify-between">
            <span>ADHEE Deposited</span>
            <span className="font-bold text-slate-700">{parseFloat(amountB || 0).toFixed(4)} ADHEE</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAdd}
        disabled={!isConnected || isButtonDisabled}
        className={`w-full h-12 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-md ${
          !isConnected || isButtonDisabled
            ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-secondary to-primary text-white hover:brightness-105 shadow-secondary/15 hover:shadow-lg active:scale-[0.99]'
        }`}
      >
        {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{getButtonText()}</span>
      </button>

      {/* Success Overlay */}
      {txSuccess && (
        <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
          <h4 className="font-display font-bold text-xl text-slate-800">Liquidity Added!</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Successfully deposited tokens into the INI/ADHEE pool on Solana Devnet.
          </p>
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-primary font-bold mt-4 hover:underline space-x-1"
          >
            <span>View on Solana Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setTxSuccess(false)}
            className="mt-6 px-6 h-10 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Back to Pool
          </button>
        </div>
      )}
    </div>
  );
}
