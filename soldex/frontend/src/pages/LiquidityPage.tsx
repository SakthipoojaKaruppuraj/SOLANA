import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useTokens } from "../hooks/useTokens";
import { usePool } from "../hooks/usePool";
import { useLiquidity } from "../hooks/useLiquidity";
import { usePoolStore } from "../stores/usePoolStore";
import { useTokenStore } from "../stores/useTokenStore";
import { motion, AnimatePresence } from "framer-motion";
import { PublicKey } from "@solana/web3.js";

export const LiquidityPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { selectedPool } = usePoolStore();
  const { tokens } = useTokenStore();
  const { refreshBalances } = useTokens();
  const { refreshPool, refreshAll, loading: poolLoading } = usePool();
  const { addLiquidity, withdrawLiquidity, loading: liqLoading, error: liqError } = useLiquidity();

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmountA, setDepositAmountA] = useState("");
  const [depositAmountB, setDepositAmountB] = useState("");
  const [withdrawLpAmount, setWithdrawLpAmount] = useState("");

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

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return;
    try {
      const tx = await addLiquidity(depositAmountA, depositAmountB);
      alert(`Liquidity added successfully! Transaction: ${tx}`);
      setDepositAmountA("");
      setDepositAmountB("");
    } catch (err: any) {
      alert(`Deposit failed: ${err.message || err}`);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return;
    try {
      const tx = await withdrawLiquidity(withdrawLpAmount);
      alert(`Liquidity removed successfully! Transaction: ${tx}`);
      setWithdrawLpAmount("");
    } catch (err: any) {
      alert(`Withdrawal failed: ${err.message || err}`);
    }
  };

  const balA = tokens[1]?.balance || 0;
  const balB = tokens[2]?.balance || 0;
  const balLp = tokens[3]?.balance || 0;

  const isInsufficientDeposit = 
    parseFloat(depositAmountA) > balA || parseFloat(depositAmountB) > balB;
  const isInsufficientWithdraw = parseFloat(withdrawLpAmount) > balLp;

  const getDepositBtnText = () => {
    if (!connected) return "Connect Wallet to Deposit";
    if (!selectedPool) return "Liquidity Pool Does Not Exist";
    if (!depositAmountA || !depositAmountB) return "Enter Token Amounts";
    if (isInsufficientDeposit) return "Insufficient Balance";
    if (liqLoading) return "Depositing...";
    return "Deposit & Mint LP";
  };

  const getWithdrawBtnText = () => {
    if (!connected) return "Connect Wallet to Withdraw";
    if (!selectedPool) return "Liquidity Pool Does Not Exist";
    if (!withdrawLpAmount) return "Enter LP Amount";
    if (isInsufficientWithdraw) return "Insufficient LP Balance";
    if (liqLoading) return "Withdrawing...";
    return "Burn LP & Withdraw";
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Liquidity Management</h1>
        <p className="text-slate-500">Provide liquidity to earn 0.30% fee on all swaps.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-card-border">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition duration-150 ${
            activeTab === "deposit"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition duration-150 ${
            activeTab === "withdraw"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      {/* Liquidity Card Container */}
      <div className="bg-white border border-card-border rounded-custom shadow-md p-6">
        {liqError && (
          <div className="mb-4 text-xs text-red-500 text-center font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
            {liqError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "deposit" ? (
            <motion.form
              key="deposit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleDeposit}
              className="space-y-4"
            >
              {/* Select Pool */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pool Address</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (connected) {
                        refreshAll();
                        const addr = localStorage.getItem("soldex_pool");
                        if (addr) { try { refreshPool(new PublicKey(addr)); } catch {} }
                      }
                    }}
                    disabled={!connected || poolLoading}
                    className="text-xs text-primary font-semibold hover:underline disabled:opacity-40"
                  >
                    {poolLoading ? "Loading..." : "↻ Refresh"}
                  </button>
                </div>
                <div className={`w-full border rounded-xl px-4 py-3 text-xs font-mono truncate ${
                  selectedPool
                    ? "bg-slate-50 border-card-border text-slate-700 font-semibold"
                    : "bg-amber-50 border-amber-200 text-amber-700 font-medium"
                }`}>
                  {selectedPool
                    ? selectedPool.address
                    : connected
                      ? poolLoading ? "Searching for pool..." : "Pool not found — click ↻ Refresh or check Dev Tools"
                      : "Connect wallet to detect pool"}
                </div>
              </div>

              {/* Input Token A */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <label>Amount Token A</label>
                  <span>Bal: {balA.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    aria-label="Amount of Token A to Deposit"
                    value={depositAmountA}
                    onChange={(e) => setDepositAmountA(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-white border border-card-border px-2 py-1 rounded-lg">
                    Token A
                  </div>
                </div>
              </div>

              {/* Input Token B */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <label>Amount Token B</label>
                  <span>Bal: {balB.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    aria-label="Amount of Token B to Deposit"
                    value={depositAmountB}
                    onChange={(e) => setDepositAmountB(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-white border border-card-border px-2 py-1 rounded-lg">
                    Token B
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!connected || !selectedPool || isInsufficientDeposit || !depositAmountA || !depositAmountB || liqLoading}
                className="w-full py-3.5 bg-primary hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-150 shadow-sm shadow-blue-500/10 text-sm"
              >
                {getDepositBtnText()}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="withdraw"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleWithdraw}
              className="space-y-4"
            >
              {/* Select Pool */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pool Address</label>
                <div className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm text-slate-700 font-semibold font-mono text-xs truncate">
                  {selectedPool ? selectedPool.address : "No active pool detected"}
                </div>
              </div>

              {/* Input LP Amount */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <label>Amount LP to Burn</label>
                  <span>Lp Balance: {balLp.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    aria-label="Amount of LP Token to Burn"
                    value={withdrawLpAmount}
                    onChange={(e) => setWithdrawLpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-white border border-card-border px-2 py-1 rounded-lg">
                    LP Token
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!connected || !selectedPool || isInsufficientWithdraw || !withdrawLpAmount || liqLoading}
                className="w-full py-3.5 bg-secondary hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition duration-150 shadow-sm shadow-violet-500/10 text-sm"
              >
                {getWithdrawBtnText()}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default LiquidityPage;
