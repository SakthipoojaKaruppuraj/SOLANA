import React, { useState, useEffect } from 'react';
import { useSolana } from '../context/SolanaContext';
import { ArrowDownUp, Settings, Info, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

export default function SwapCard() {
  const {
    isConnected,
    isConnecting,
    balances,
    reserves,
    executeSwap,
    connectWallet,
  } = useSolana();

  // Component States
  const [fromToken, setFromToken] = useState('INI');
  const [toToken, setToToken] = useState('ADHEE');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [customSlippage, setCustomSlippage] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  
  // Transaction feedback modal
  const [txSuccess, setTxSuccess] = useState(false);
  const [txSig, setTxSig] = useState('');

  // Reserve mapping
  const reserveIn = fromToken === 'INI' ? reserves.ini : reserves.adhee;
  const reserveOut = fromToken === 'INI' ? reserves.adhee : reserves.ini;
  const fromBalance = fromToken === 'INI' ? balances.ini : balances.adhee;

  // Swap math calculations
  useEffect(() => {
    const numIn = parseFloat(amountIn);
    if (!amountIn || isNaN(numIn) || numIn <= 0) {
      setAmountOut('');
      return;
    }

    // Constant Product calculation: (x + dx) * (y - dy) = k
    // dy = (y * dx) / (x + dx)
    const k = reserveIn * reserveOut;
    const newReserveIn = reserveIn + numIn;
    const newReserveOut = k / newReserveIn;
    const calculatedOut = reserveOut - newReserveOut;

    setAmountOut(calculatedOut.toFixed(6));
  }, [amountIn, reserveIn, reserveOut]);

  // Handle Flipping Token Direction
  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmountIn(amountOut ? parseFloat(amountOut).toFixed(4) : '');
    setAmountOut('');
  };

  const handleSwap = async () => {
    if (!amountIn || isNaN(parseFloat(amountIn))) return;
    setIsSwapping(true);
    try {
      const sig = await executeSwap(fromToken, toToken, amountIn, amountOut);
      setTxSig(sig);
      setTxSuccess(true);
      setAmountIn('');
      setAmountOut('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwapping(false);
    }
  };

  // Rates and Impacts
  const numIn = parseFloat(amountIn) || 0;
  const numOut = parseFloat(amountOut) || 0;
  
  const spotRate = reserveIn > 0 ? (reserveOut / reserveIn) : 0;
  const executionRate = numIn > 0 ? (numOut / numIn) : spotRate;
  
  // Price Impact = 1 - (executionRate / spotRate)
  const priceImpact = spotRate > 0 && numIn > 0 
    ? Math.max(0, (1 - (executionRate / spotRate)) * 100) 
    : 0;

  const currentSlippage = slippage === 'custom' ? customSlippage : slippage;
  const minReceived = numOut > 0 
    ? numOut * (1 - (parseFloat(currentSlippage) || 0.5) / 100) 
    : 0;

  // Button Content Helper
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isConnecting) return 'Connecting...';
    if (isSwapping) return 'Swapping...';
    if (!amountIn) return 'Enter an Amount';
    if (parseFloat(amountIn) > (fromBalance || 0)) return `Insufficient ${fromToken} Balance`;
    return 'Swap Tokens';
  };

  const isButtonDisabled = isConnected && (
    isSwapping || 
    !amountIn || 
    parseFloat(amountIn) > (fromBalance || 0) || 
    parseFloat(amountIn) <= 0
  );

  return (
    <div className="w-full max-w-lg bg-card-custom border border-border-custom rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 relative">
      
      {/* Swap Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl text-slate-800">Swap</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-200 ${showSettings ? 'rotate-45' : ''}`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Slippage Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Slippage Tolerance</span>
            <span className="text-xs font-semibold text-primary">{currentSlippage}%</span>
          </div>
          <div className="flex gap-2">
            {['0.1', '0.5', '1.0'].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setSlippage(val);
                  setCustomSlippage('');
                }}
                className={`flex-1 h-9 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                  slippage === val
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {val}%
              </button>
            ))}
            <div className={`flex-[1.5] h-9 rounded-xl border flex items-center px-2 bg-white ${slippage === 'custom' ? 'border-primary' : 'border-slate-200'}`}>
              <input
                type="number"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => {
                  setSlippage('custom');
                  setCustomSlippage(e.target.value);
                }}
                className="w-full h-full bg-transparent text-xs font-semibold outline-none text-slate-700"
              />
              <span className="text-xs font-semibold text-slate-400 ml-1">%</span>
            </div>
          </div>
        </div>
      )}

      {/* From Token Card */}
      <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl input-field-focus">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-400">From</span>
          <span className="text-xs font-semibold text-slate-500 flex items-center">
            Balance:{' '}
            <span className="font-bold text-slate-700 ml-1">
              {isConnected ? (fromBalance !== null ? fromBalance : <Loader2 className="w-3 h-3 animate-spin inline ml-1" />) : '--'}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            disabled={!isConnected}
            className="w-2/3 bg-transparent text-2xl font-display font-bold outline-none text-slate-800 placeholder-slate-300 disabled:cursor-not-allowed"
          />
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="font-display font-bold text-sm text-slate-800">{fromToken}</span>
          </div>
        </div>
        {isConnected && fromBalance > 0 && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setAmountIn(fromBalance.toString())}
              className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors"
            >
              MAX
            </button>
          </div>
        )}
      </div>

      {/* Flip Button */}
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-3 z-10">
        <button
          onClick={handleFlip}
          disabled={!isConnected}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-primary flex items-center justify-center text-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* To Token Card */}
      <div className="mt-5 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-400">To</span>
          <span className="text-xs font-semibold text-slate-500">
            Balance:{' '}
            <span className="font-bold text-slate-700">
              {isConnected ? (toToken === 'ADHEE' ? balances.adhee : balances.ini) : '--'}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={amountOut}
            className="w-2/3 bg-transparent text-2xl font-display font-bold outline-none text-slate-800 placeholder-slate-300"
          />
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="font-display font-bold text-sm text-slate-800">{toToken}</span>
          </div>
        </div>
      </div>

      {/* Exchange Rate details */}
      {numIn > 0 && numOut > 0 && (
        <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-500 animate-slide-up">
          <div className="flex items-center justify-between">
            <span>Rate</span>
            <span className="font-bold text-slate-700">
              1 {fromToken} = {executionRate.toFixed(4)} {toToken}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              Price Impact
              <Info className="w-3.5 h-3.5 ml-1 text-slate-400 cursor-help" title="Price impact from Constant Product formula" />
            </span>
            <span className={`font-bold ${priceImpact > 10 ? 'text-red-500' : priceImpact > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Minimum Received</span>
            <span className="font-bold text-slate-700">
              {minReceived.toFixed(4)} {toToken}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={isConnected ? handleSwap : () => connectWallet('demo')}
        disabled={isButtonDisabled}
        className={`w-full h-12 mt-5 rounded-2xl font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center space-x-2 ${
          !isConnected 
            ? 'bg-primary hover:bg-primary-hover text-white shadow-primary/10 hover:shadow-primary/20'
            : isButtonDisabled
              ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-primary to-secondary text-white hover:brightness-105 shadow-primary/15 hover:shadow-lg active:scale-[0.99]'
        }`}
      >
        {isSwapping && <Loader2 className="w-4 h-4 animate-spin text-white" />}
        <span>{getButtonText()}</span>
      </button>

      {/* Tx Success Banner Overlay */}
      {txSuccess && (
        <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
          <h4 className="font-display font-bold text-xl text-slate-800">Swap Confirmed!</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Swapped {numIn} {fromToken} for {numOut.toFixed(4)} {toToken} successfully on Solana Devnet.
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
            Back to Swap
          </button>
        </div>
      )}
    </div>
  );
}
