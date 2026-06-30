import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";

/**
 * Main application sticky header containing logo, network selection info, and wallet adapters.
 */
export const Header: React.FC = () => {
  const { connection } = useConnection();

  // Determine network display name based on connection endpoint
  const getNetworkName = () => {
    const endpoint = connection?.rpcEndpoint || "";
    if (endpoint.includes("devnet")) return "Devnet";
    if (endpoint.includes("testnet")) return "Testnet";
    if (endpoint.includes("mainnet")) return "Mainnet";
    return "Localnet";
  };

  const network = getNetworkName();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-card-border shadow-sm px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
          SD
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          SOLDex
        </span>
      </div>

      {/* Action Items */}
      <div className="flex items-center space-x-4">
        {/* Network Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 border border-card-border rounded-xl text-xs font-semibold text-slate-600">
          <span className={`w-2 h-2 rounded-full ${network === "Devnet" ? "bg-green-500 animate-pulse" : "bg-blue-500"}`} />
          <span>{network}</span>
        </div>

        {/* Disabled Dark Mode Toggle (Required by Spec) */}
        <button
          disabled
          aria-label="Dark mode toggle"
          className="p-2 bg-slate-100 border border-card-border text-slate-400 rounded-xl cursor-not-allowed opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        {/* Wallet Adapter Connect Button */}
        <div className="flex items-center">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};
