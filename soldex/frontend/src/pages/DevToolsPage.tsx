import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../hooks/useWallet";
import { useTokens } from "../hooks/useTokens";
import { usePool } from "../hooks/usePool";
import { useTokenStore } from "../stores/useTokenStore";
import { usePoolStore } from "../stores/usePoolStore";
import { PublicKey } from "@solana/web3.js";
import { config } from "../config";

interface DiagnosticsState {
  rpc: "checking" | "ok" | "failed";
  program: "checking" | "ok" | "failed";
  wallet: "checking" | "ok" | "warn" | "failed";
  solBalance: number;
  details: string;
}

export const DevToolsPage: React.FC = () => {
  const { connected, publicKey, connection } = useWallet();
  const { setupTokens, faucetMint, refreshBalances } = useTokens();
  const { createPool, refreshPool, getActivePDAs } = usePool();
  const { tokens } = useTokenStore();
  const { selectedPool } = usePoolStore();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mintAmount, setMintAmount] = useState("100");
  const [selectedMint, setSelectedMint] = useState("");
  const [feeBps, setFeeBps] = useState("30");

  // Quick restore state for pasting existing addresses
  const [restoreMintA, setRestoreMintA] = useState("");
  const [restoreMintB, setRestoreMintB] = useState("");
  const [showRestore, setShowRestore] = useState(false);

  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    rpc: "checking",
    program: "checking",
    wallet: "checking",
    solBalance: 0,
    details: "Initiating diagnostics...\n",
  });

  const tokenAMintStr = localStorage.getItem("soldex_mint_a");
  const tokenBMintStr = localStorage.getItem("soldex_mint_b");
  const poolAddrStr = localStorage.getItem("soldex_pool");

  // Run diagnostics
  const runDiagnostics = useCallback(async () => {
    setDiagnostics((prev) => ({
      ...prev,
      rpc: "checking",
      program: "checking",
      wallet: "checking",
      details: "Initiating diagnostics...\n",
    }));

    let details = "";
    let rpc: "ok" | "failed" = "failed";
    let programStatus: "ok" | "failed" = "failed";
    let walletStatus: "ok" | "warn" | "failed" = "failed";
    let solBalance = 0;

    try {
      const version = await connection.getVersion();
      rpc = "ok";
      details += `✓ RPC Connected: version ${version["solana-core"] || "unknown"}\n`;
    } catch (e: any) {
      details += `✗ RPC Connection Failed: ${e.message || e}\n`;
    }

    try {
      const programInfo = await connection.getAccountInfo(config.programId);
      if (programInfo) {
        programStatus = "ok";
        details += `✓ Program ID Found: ${config.programId.toBase58()}\n`;
      } else {
        details += `✗ Program ID NOT Deployed: ${config.programId.toBase58()}\n`;
      }
    } catch (e: any) {
      details += `✗ Program Query Error: ${e.message || e}\n`;
    }

    if (connected && publicKey) {
      try {
        const sol = await connection.getBalance(publicKey);
        solBalance = sol / 1e9;
        walletStatus = solBalance >= 0.05 ? "ok" : "warn";
        details += `✓ Wallet Connected: ${publicKey.toBase58()}\n`;
        details += `✓ SOL Balance: ${solBalance.toFixed(4)} SOL\n`;
        if (solBalance < 0.05) {
          details += `! WARNING: SOL balance is extremely low (< 0.05 SOL). Initialize transaction fees might fail.\n`;
        }
      } catch (e: any) {
        details += `✗ Wallet Balance Fetch Error: ${e.message || e}\n`;
      }
    } else {
      details += `✗ Wallet not connected. Please connect inside the top header.\n`;
    }

    setDiagnostics({
      rpc,
      program: programStatus,
      wallet: walletStatus,
      solBalance,
      details,
    });
  }, [connection, connected, publicKey]);

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
    }
    runDiagnostics();
  }, [connected, publicKey, refreshBalances, refreshPool, poolAddrStr, runDiagnostics]);

  useEffect(() => {
    if (tokenAMintStr && !selectedMint) {
      setSelectedMint(tokenAMintStr);
    }
  }, [tokenAMintStr, selectedMint]);

  const handleSetupTokens = async () => {
    setLoading(true);
    setStatus("Creating SPL Token A and Token B mints (User = Authority)...");
    setError(null);
    try {
      await setupTokens();
      setStatus("Tokens created successfully and saved to localStorage!");
      runDiagnostics();
    } catch (e: any) {
      setError(e.message || "Failed to setup tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMint) return;
    setLoading(true);
    setStatus(`Minting ${mintAmount} tokens...`);
    setError(null);
    try {
      await faucetMint(selectedMint, parseFloat(mintAmount));
      setStatus(`Successfully minted ${mintAmount} tokens!`);
      runDiagnostics();
    } catch (e: any) {
      setError(e.message || "Failed to mint tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePool = async () => {
    if (!tokenAMintStr || !tokenBMintStr) {
      setError("Please create Token A and Token B first.");
      return;
    }
    setLoading(true);
    setStatus("Deriving PDAs and initializing constant product pool on-chain...");
    setError(null);
    try {
      const bps = parseInt(feeBps);
      const res = await createPool(tokenAMintStr, tokenBMintStr, bps);
      setStatus(`Pool successfully initialized at: ${res.poolAddress}`);
      runDiagnostics();
    } catch (e: any) {
      setError(e.message || "Failed to initialize pool");
    } finally {
      setLoading(false);
    }
  };

  // Import/Export / Reset Configs
  const handleQuickRestore = () => {
    const mintA = restoreMintA.trim();
    const mintB = restoreMintB.trim();
    if (!mintA || !mintB) {
      alert("Please enter both Token A and Token B mint addresses.");
      return;
    }
    try {
      const mintAPub = new PublicKey(mintA);
      const mintBPub = new PublicKey(mintB);
      // Derive the pool PDA so the user doesn't need to paste it separately
      const { poolPDA } = getActivePDAs(mintAPub, mintBPub);
      localStorage.setItem("soldex_mint_a", mintA);
      localStorage.setItem("soldex_mint_b", mintB);
      localStorage.setItem("soldex_pool", poolPDA.toBase58());
      alert(`Configuration restored!\nPool: ${poolPDA.toBase58()}\nReloading...`);
      window.location.reload();
    } catch (e: any) {
      alert(`Invalid address: ${e.message || e}`);
    }
  };

  const handleExportConfig = () => {
    const data = {
      VITE_PROGRAM_ID: config.programId.toBase58(),
      soldex_mint_a: localStorage.getItem("soldex_mint_a") || "",
      soldex_mint_b: localStorage.getItem("soldex_mint_b") || "",
      soldex_pool: localStorage.getItem("soldex_pool") || "",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "soldex_dev_config.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.soldex_mint_a) localStorage.setItem("soldex_mint_a", data.soldex_mint_a);
        if (data.soldex_mint_b) localStorage.setItem("soldex_mint_b", data.soldex_mint_b);
        if (data.soldex_pool) localStorage.setItem("soldex_pool", data.soldex_pool);
        
        alert("Configuration imported successfully! Reloading...");
        window.location.reload();
      } catch (err: any) {
        alert(`Failed to parse configuration file: ${err.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetEnv = () => {
    if (confirm("Are you sure you want to reset your local development configuration? This will clear saved token mints and pools from localStorage.")) {
      localStorage.removeItem("soldex_mint_a");
      localStorage.removeItem("soldex_mint_b");
      localStorage.removeItem("soldex_pool");
      alert("Configuration reset! Reloading...");
      window.location.reload();
    }
  };

  const activePDAs = tokenAMintStr && tokenBMintStr
    ? getActivePDAs(new PublicKey(tokenAMintStr), new PublicKey(tokenBMintStr))
    : null;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Developer Tools</h1>
          <p className="text-slate-500">Configure custom test tokens and initialize liquidity pools on Devnet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportConfig}
            className="px-3.5 py-2 bg-slate-100 border border-card-border hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Export Config
          </button>
          <label className="px-3.5 py-2 bg-slate-100 border border-card-border hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
            Import Config
            <input type="file" onChange={handleImportConfig} accept=".json" className="hidden" />
          </label>
          <button
            onClick={handleResetEnv}
            className="px-3.5 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition"
          >
            Reset Env
          </button>
        </div>
      </div>

      {!connected && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-custom text-amber-700 text-sm">
          Please connect your wallet in the header to access developer tools.
        </div>
      )}

      {status && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-custom text-blue-700 text-sm">
          {status}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-custom text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Quick Restore Banner — shown when localStorage is empty (e.g. different port) */}
      {!tokenAMintStr && !tokenBMintStr && (
        <div className="bg-amber-50 border border-amber-200 rounded-custom shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-amber-800">⚠️ No Configuration Found</h2>
              <p className="text-xs text-amber-700 mt-0.5">
                No token addresses in storage. Paste existing mint addresses below, or create new ones.
              </p>
            </div>
            <button
              onClick={() => setShowRestore((v) => !v)}
              className="px-3 py-1.5 bg-amber-100 border border-amber-300 hover:bg-amber-200 text-amber-800 font-bold rounded-lg text-xs transition"
            >
              {showRestore ? "Cancel" : "Restore Config"}
            </button>
          </div>

          {showRestore && (
            <div className="space-y-3 pt-2 border-t border-amber-200">
              <p className="text-xs text-amber-700 font-medium">
                Paste the Token A and Token B mint addresses from your previous session (visible in the Dev Tools address explorer).
                The Pool PDA will be auto-derived.
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Token A Mint Address</label>
                  <input
                    type="text"
                    placeholder="e.g. EtW5PrMA..."
                    value={restoreMintA}
                    onChange={(e) => setRestoreMintA(e.target.value)}
                    className="w-full px-3 py-2 border border-card-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Token B Mint Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 9dQbzL3X..."
                    value={restoreMintB}
                    onChange={(e) => setRestoreMintB(e.target.value)}
                    className="w-full px-3 py-2 border border-card-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>
              <button
                onClick={handleQuickRestore}
                disabled={!restoreMintA.trim() || !restoreMintB.trim()}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition"
              >
                Restore &amp; Save Configuration
              </button>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics Panel */}
      <div className="bg-white border border-card-border rounded-custom shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">System Health Diagnostics</h2>
          <button
            onClick={runDiagnostics}
            className="px-3 py-1.5 bg-slate-50 border border-card-border hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition"
          >
            Run Checks
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 border border-card-border rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full ${diagnostics.rpc === "ok" ? "bg-green-500" : diagnostics.rpc === "checking" ? "bg-blue-500 animate-pulse" : "bg-red-500"}`} />
            <div>
              <div className="font-bold text-xs text-slate-700">RPC Endpoint</div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{config.solanaRpcUrl}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-card-border rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full ${diagnostics.program === "ok" ? "bg-green-500" : diagnostics.program === "checking" ? "bg-blue-500 animate-pulse" : "bg-red-500"}`} />
            <div>
              <div className="font-bold text-xs text-slate-700">Anchor Program</div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{config.programId.toBase58()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-card-border rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full ${diagnostics.wallet === "ok" ? "bg-green-500" : diagnostics.wallet === "warn" ? "bg-amber-500" : diagnostics.wallet === "checking" ? "bg-blue-500 animate-pulse" : "bg-red-500"}`} />
            <div>
              <div className="font-bold text-xs text-slate-700">Wallet Fees Status</div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                {diagnostics.wallet === "ok" ? "Ready" : diagnostics.wallet === "warn" ? "Low SOL balance" : "Not connected"}
              </div>
            </div>
          </div>
        </div>
        <pre className="p-4 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl overflow-x-auto max-h-40 whitespace-pre-line">
          {diagnostics.details}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-card-border rounded-custom shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">1. Setup Test Mints</h2>
          <p className="text-xs text-slate-500">
            Create two custom SPL token mints directly on Devnet. Your connected wallet will be set as the Mint Authority, which allows you to mint unlimited quantities of these tokens for testing.
          </p>

          <button
            onClick={handleSetupTokens}
            disabled={!connected || loading}
            className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl transition duration-150 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-sm"
          >
            {tokenAMintStr ? "Re-create Test Tokens" : "Create Test Token A & B"}
          </button>

          <hr className="border-card-border" />

          <h2 className="text-xl font-bold text-slate-800">2. Faucet (Mint Tokens)</h2>
          <form onSubmit={handleMintTokens} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Select Token</label>
              <select
                value={selectedMint}
                onChange={(e) => setSelectedMint(e.target.value)}
                className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              >
                <option value="">-- Select Token --</option>
                {tokenAMintStr && <option value={tokenAMintStr}>Token A ({tokenAMintStr.slice(0, 8)}...)</option>}
                {tokenBMintStr && <option value={tokenBMintStr}>Token B ({tokenBMintStr.slice(0, 8)}...)</option>}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Amount to Mint</label>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={!connected || !selectedMint || loading}
              className="w-full py-3 bg-secondary hover:bg-violet-700 text-white font-bold rounded-xl transition duration-150 disabled:bg-slate-200 disabled:text-slate-400 text-sm"
            >
              Mint Test Tokens
            </button>
          </form>
        </div>

        <div className="bg-white border border-card-border rounded-custom shadow-sm p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">3. Initialize Liquidity Pool</h2>
            <p className="text-xs text-slate-500">
              Derive the PDA accounts for the AMM liquidity pool (using Token A and Token B mints) and register the pool, the LP token mint, and vaults on-chain.
            </p>

            <div className="space-y-3 p-4 bg-slate-50 border border-card-border rounded-xl text-xs">
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Token A Mint:</span>
                <span className="font-mono text-slate-700 break-all">{tokenAMintStr || "Not Created"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Token B Mint:</span>
                <span className="font-mono text-slate-700 break-all">{tokenBMintStr || "Not Created"}</span>
              </div>
              {activePDAs && (
                <div>
                  <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px]">Derived Pool PDA:</span>
                  <span className="font-mono text-slate-700 break-all">
                    {activePDAs.poolPDA.toBase58()}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Pool Trading Fee (BPS)</label>
              <input
                type="number"
                value={feeBps}
                onChange={(e) => setFeeBps(e.target.value)}
                placeholder="30 (0.30%)"
                className="w-full bg-slate-50 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          <button
            onClick={handleInitializePool}
            disabled={!connected || !tokenAMintStr || !tokenBMintStr || loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 disabled:bg-slate-200 disabled:text-slate-400 text-sm mt-4"
          >
            {poolAddrStr ? "Re-initialize Pool" : "Initialize Liquidity Pool"}
          </button>
        </div>
      </div>

      {/* Explorer / State Panel */}
      <div className="bg-white border border-card-border rounded-custom shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Protocol State Details & Address Explorer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="p-4 border border-card-border rounded-xl bg-slate-50 space-y-2">
              <h3 className="font-bold text-slate-700">Token Balances</h3>
              <div className="flex justify-between">
                <span>Token A:</span>
                <span className="font-bold text-slate-800">{tokens[1]?.balance ?? 0} SDXA</span>
              </div>
              <div className="flex justify-between">
                <span>Token B:</span>
                <span className="font-bold text-slate-800">{tokens[2]?.balance ?? 0} SDXB</span>
              </div>
              <div className="flex justify-between">
                <span>LP Token:</span>
                <span className="font-bold text-slate-800">{tokens[3]?.balance ?? 0} SDX-LP</span>
              </div>
            </div>

            <div className="p-4 border border-card-border rounded-xl bg-slate-50 space-y-2">
              <h3 className="font-bold text-slate-700">Pool Reserves</h3>
              <div className="flex justify-between">
                <span>Reserve A:</span>
                <span className="font-bold text-slate-800">{selectedPool ? (selectedPool.reserveA / 10 ** 9).toLocaleString() : 0} SDXA</span>
              </div>
              <div className="flex justify-between">
                <span>Reserve B:</span>
                <span className="font-bold text-slate-800">{selectedPool ? (selectedPool.reserveB / 10 ** 9).toLocaleString() : 0} SDXB</span>
              </div>
              <div className="flex justify-between">
                <span>Total LP Supply:</span>
                <span className="font-bold text-slate-800">{selectedPool ? (selectedPool.totalLpSupply / 10 ** 9).toLocaleString() : 0} LP</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-card-border rounded-xl bg-slate-50 space-y-3 font-mono text-[10px] break-all">
            <h3 className="font-bold text-slate-700 font-sans text-xs">Active Program & Derived PDAs</h3>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-sans">Program ID:</span>
              <span className="text-slate-800">{config.programId.toBase58()}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-sans">Pool PDA:</span>
              <span className="text-slate-800">{poolAddrStr || "Not derived"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-sans">Vault Authority PDA:</span>
              <span className="text-slate-800">{activePDAs?.vaultAuthorityPDA.toBase58() || "Not derived"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-sans">Vault A:</span>
              <span className="text-slate-800">{activePDAs?.vaultA.toBase58() || "Not derived"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-sans">Vault B:</span>
              <span className="text-slate-800">{activePDAs?.vaultB.toBase58() || "Not derived"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-sans">LP Mint PDA:</span>
              <span className="text-slate-800">{activePDAs?.lpMintPDA.toBase58() || "Not derived"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPage;
