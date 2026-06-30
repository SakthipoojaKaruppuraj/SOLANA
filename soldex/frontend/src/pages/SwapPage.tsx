import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useTokens } from "../hooks/useTokens";
import { usePool } from "../hooks/usePool";
import { useSwap } from "../hooks/useSwap";
import { useTokenStore, type Token } from "../stores/useTokenStore";
import { usePoolStore } from "../stores/usePoolStore";
import { ArrowsUpDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@solana/web3.js";

export const SwapPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { tokens, tokenIn, tokenOut, setTokenIn, setTokenOut } = useTokenStore();
  const { selectedPool } = usePoolStore();
  const { refreshBalances } = useTokens();
  const { refreshPool, refreshAll } = usePool();
  const { calculateAmountOut, swapTokens, loading: swapLoading, error: swapError } = useSwap();

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);

  // Modal selector states
  const [showInSelector, setShowInSelector] = useState(false);
  const [showOutSelector, setShowOutSelector] = useState(false);

  const poolAddrStr = localStorage.getItem("soldex_pool");

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalances();
      if (poolAddrStr) {
        try {
          refreshPool(new PublicKey(poolAddrStr));
        } catch {
          console.error("Invalid saved pool address");
        }
      }
      // Always auto-discover pools from chain to ensure selectedPool is set
      refreshAll();
    }
  }, [connected, publicKey, refreshBalances, refreshPool, refreshAll, poolAddrStr]);

  useEffect(() => {
    const num = parseFloat(amountIn);
    if (!isNaN(num) && num > 0) {
      setAmountOut(calculateAmountOut(num).toFixed(6));
    } else {
      setAmountOut("");
    }
  }, [amountIn, tokenIn, selectedPool, calculateAmountOut]);

  const handleSwapMints = () => {
    if (tokenIn && tokenOut) {
      const temp = tokenIn;
      setTokenIn(tokenOut);
      setTokenOut(temp);
      setAmountIn("");
      setAmountOut("");
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !amountIn) return;
    try {
      const tx = await swapTokens(amountIn, slippage);
      alert(`Swap successful! Transaction Signature: ${tx}`);
      setAmountIn("");
    } catch (err: any) {
      alert(`Swap failed: ${err.message || err}`);
    }
  };

  const balance = tokenIn?.balance || 0;
  const isInsufficientBalance = parseFloat(amountIn) > balance;

  const getButtonText = () => {
    if (!connected) return "Connect Wallet to Trade";
    if (!selectedPool) return "Liquidity Pool Does Not Exist";
    if (!amountIn) return "Enter an amount";
    if (isInsufficientBalance) return `Insufficient ${tokenIn?.symbol} Balance`;
    if (swapLoading) return "Swapping...";
    return "Swap";
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Swap Tokens</h1>
        <p className="text-slate-500">Trade instant SPL tokens directly from your Solana wallet.</p>
      </div>

      <div className="relative bg-white border border-card-border rounded-custom shadow-md p-6 space-y-4">
        {/* Settings Button */}
        <div className="absolute right-6 top-6 z-10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-slate-50 border border-card-border rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slippage Tolerance</h3>
            <div className="flex space-x-2">
              {["0.1", "0.5", "1.0"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                    slippage === s
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-card-border text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {s}%
                </button>
              ))}
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="Custom"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full h-full text-center bg-white border border-card-border rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSwap} className="space-y-4">
          {/* Input Box: Token In */}
          <div className="p-4 bg-slate-50 border border-card-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>You Sell</span>
              <span>Balance: {tokenIn?.balance !== undefined ? tokenIn.balance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <input
                type="number"
                placeholder="0.00"
                step="any"
                aria-label="Sell Amount"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="w-2/3 bg-transparent text-xl font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowInSelector(true)}
                aria-label="Select source token"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-card-border rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{tokenIn?.symbol}</span>
                <span className="text-xs text-slate-400">▼</span>
              </button>
            </div>
          </div>

          {/* Swap Direction Toggle Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwapMints}
              aria-label="Reverse trade direction"
              className="p-2.5 bg-white border border-card-border rounded-full hover:bg-slate-50 hover:text-primary transition shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowsUpDownIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Input Box: Token Out */}
          <div className="p-4 bg-slate-50 border border-card-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>You Buy</span>
              <span>Balance: {tokenOut?.balance !== undefined ? tokenOut.balance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <input
                type="number"
                placeholder="0.00"
                aria-label="Buy Amount"
                value={amountOut}
                readOnly
                className="w-2/3 bg-transparent text-xl font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowOutSelector(true)}
                aria-label="Select destination token"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-card-border rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{tokenOut?.symbol}</span>
                <span className="text-xs text-slate-400">▼</span>
              </button>
            </div>
          </div>

          {/* Pricing Info */}
          {amountIn && selectedPool && (
            <div className="px-1 text-xs text-slate-500 flex justify-between">
              <span>Exchange Rate:</span>
              <span className="font-semibold text-slate-700">
                1 {tokenIn?.symbol} = {calculateAmountOut(1).toFixed(6)} {tokenOut?.symbol}
              </span>
            </div>
          )}

          {swapError && (
            <div className="text-xs text-red-500 text-center font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
              {swapError}
            </div>
          )}

          {/* Swap Trigger Button */}
          <button
            type="submit"
            disabled={!connected || !amountIn || isInsufficientBalance || swapLoading || !selectedPool}
            className="w-full py-4 bg-primary hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-150 shadow-sm shadow-blue-500/10"
          >
            {getButtonText()}
          </button>
        </form>
      </div>

      {/* Modals for Selectors */}
      {showInSelector && (
        <TokenSelectorModal
          tokens={tokens}
          onSelect={(t) => {
            setTokenIn(t);
            setShowInSelector(false);
          }}
          onClose={() => setShowInSelector(false)}
        />
      )}

      {showOutSelector && (
        <TokenSelectorModal
          tokens={tokens}
          onSelect={(t) => {
            setTokenOut(t);
            setShowOutSelector(false);
          }}
          onClose={() => setShowOutSelector(false)}
        />
      )}
    </div>
  );
};

// Sub-component: Token Selector Modal
const TokenSelectorModal: React.FC<{
  tokens: Token[];
  onSelect: (t: Token) => void;
  onClose: () => void;
}> = ({ tokens, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-w-xs w-full bg-white border border-card-border rounded-custom shadow-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
          <span className="font-bold text-slate-800">Select Token</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
            ✕
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
          {tokens.map((token) => (
            <button
              key={token.mint}
              onClick={() => onSelect(token)}
              className="w-full flex items-center space-x-3 p-2.5 hover:bg-slate-50 rounded-xl text-left transition"
            >
              {token.logoURI ? (
                <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold text-xs">
                  {token.symbol.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-bold text-slate-800 text-sm">{token.symbol}</div>
                <div className="text-xs text-slate-400 font-mono text-[10px] truncate max-w-[180px]">{token.mint}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwapPage;

