import React from "react";

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">About SOLDex</h1>
        <p className="text-slate-500">Learn about our decentralized liquidity protocol.</p>
      </div>

      <div className="p-8 bg-white border border-card-border rounded-custom shadow-sm space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">What is SOLDex?</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            SOLDex is an on-chain Constant Product Automated Market Maker (AMM) built on the Solana blockchain.
            It utilizes the mathematical invariant formula <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary font-semibold">x * y = k</code> 
            to execute slippage-protected token swaps and manage atomic liquidity additions/withdrawals cleanly with minimal transaction fees.
          </p>
        </section>

        <hr className="border-card-border" />

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-card-border bg-slate-50 rounded-xl space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Constant Product Swap</h3>
              <p className="text-xs text-slate-500">
                Execute swaps from Token A ↔ Token B or vice-versa with a flat 0.30% protocol trading fee collected directly to pool reserves.
              </p>
            </div>
            <div className="p-4 border border-card-border bg-slate-50 rounded-xl space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Atomic Liquidity Addition</h3>
              <p className="text-xs text-slate-500">
                Add dual-token liquidity and mint LP token shares in a single transaction, preventing frontrunning and price manipulation.
              </p>
            </div>
            <div className="p-4 border border-card-border bg-slate-50 rounded-xl space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">SPL Token compatibility</h3>
              <p className="text-xs text-slate-500">
                Exclusively interacts using SPL standard token interfaces, enabling native compatibility with custom SPL tokens on Solana.
              </p>
            </div>
            <div className="p-4 border border-card-border bg-slate-50 rounded-xl space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Lightning Fast Transactions</h3>
              <p className="text-xs text-slate-500">
                Solana's sub-second finality ensures instant swap execution and real-time liquidity provisioning.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-card-border" />

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Protocol Fees</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every swap transaction deducts a 0.30% protocol trading fee, which is added directly to the pool reserves.
            These accumulated fees dynamically grow the value of LP tokens, providing passive yield to liquidity providers when they redeem/burn their LP shares.
          </p>
        </section>
      </div>
    </div>
  );
};
export default AboutPage;
