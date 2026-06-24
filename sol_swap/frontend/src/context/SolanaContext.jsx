import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SolanaContext = createContext();

// Devnet Config and Public Keys
const DEVNET_RPC_URL = 'https://api.devnet.solana.com';
const DEMO_WALLET_ADDRESS = 'GiGRkV9BPXtzJoft9BH18k8kjxV62LEWjy5K1RB29djs';

// Mints
const INI_MINT = '8UKDpgBeAtcCMRM2xZvEtvzrzYb3Gt647gGbv1ZYnVi9';
const ADHEE_MINT = '7PjaYk2MgU7vcvPpqBqjrsT26sqE1cfW1UjbDTxQRNLT';

// ATAs for Demo Wallet
const INI_ATA = 'FZx9Lgx59f4MDWG5AonKSJEwZZ582zznx8TA2dg4x3Pm';
const ADHEE_ATA = 'Cv8pRVDEfdTBro9PnrTSgFUuT5CZLoHkv62oVgVcu4rD';

// Pool Vaults (reserves)
const INI_VAULT = 'Hj8JLixzBs7T13SAB44eLaehLeV5f4pX6ccLCVt1qiag';
const ADHEE_VAULT = 'ASWCDej67vfUpTSmo4toKBVET83tWZQaqASzcocfiYd9';

// Helpers to fetch Solana RPC
async function fetchSolanaRPC(method, params = []) {
  try {
    const response = await fetch(DEVNET_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  } catch (error) {
    console.error(`Solana RPC Error (${method}):`, error);
    throw error;
  }
}

export const SolanaProvider = ({ children }) => {
  // Connection states
  const [walletType, setWalletType] = useState(null); // 'demo' | 'phantom' | null
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Live On-Chain Data
  const [balances, setBalances] = useState({ sol: null, ini: null, adhee: null });
  const [reserves, setReserves] = useState({ ini: 60.0, adhee: 42.0, k: 2520.0 }); // Fallback values
  const [isLoadingReserves, setIsLoadingReserves] = useState(false);
  const [networkPing, setNetworkPing] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch reserves (pool state) from Solana Devnet
  const fetchReserves = useCallback(async () => {
    setIsLoadingReserves(true);
    const start = performance.now();
    try {
      // Fetch INI Pool Vault Balance
      const iniRes = await fetchSolanaRPC('getTokenAccountBalance', [INI_VAULT]);
      const iniAmount = iniRes?.value?.uiAmount ?? 60.0;

      // Fetch ADHEE Pool Vault Balance
      const adheeRes = await fetchSolanaRPC('getTokenAccountBalance', [ADHEE_VAULT]);
      const adheeAmount = adheeRes?.value?.uiAmount ?? 42.0;

      const k = iniAmount * adheeAmount;
      setReserves({
        ini: iniAmount,
        adhee: adheeAmount,
        k: parseFloat(k.toFixed(4)),
      });
      setNetworkPing(Math.round(performance.now() - start));
    } catch (e) {
      console.warn('Failed to fetch on-chain pool reserves, using local defaults.', e);
    } finally {
      setIsLoadingReserves(false);
    }
  }, []);

  // Fetch balances for a wallet address from Devnet
  const fetchWalletBalances = useCallback(async (address) => {
    if (!address) return;
    try {
      // 1. SOL Balance
      const solRes = await fetchSolanaRPC('getBalance', [address]);
      const solVal = solRes?.value ? solRes.value / 1e9 : 0.0;

      let iniVal = 0.0;
      let adheeVal = 0.0;

      if (address === DEMO_WALLET_ADDRESS) {
        // Fetch Token ATA balances directly for the Demo Wallet
        const iniRes = await fetchSolanaRPC('getTokenAccountBalance', [INI_ATA]);
        iniVal = iniRes?.value?.uiAmount ?? 40.0;

        const adheeRes = await fetchSolanaRPC('getTokenAccountBalance', [ADHEE_ATA]);
        adheeVal = adheeRes?.value?.uiAmount ?? 58.0;
      } else {
        // Standard wallet adapter: query ATAs or simulate
        // For a general address, we try to search for the token accounts by owner
        try {
          const accountsRes = await fetchSolanaRPC('getTokenAccountsByOwner', [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' },
          ]);

          if (accountsRes?.value) {
            accountsRes.value.forEach((acc) => {
              const info = acc.account.data.parsed.info;
              if (info.mint === INI_MINT) {
                iniVal = info.tokenAmount.uiAmount;
              } else if (info.mint === ADHEE_MINT) {
                adheeVal = info.tokenAmount.uiAmount;
              }
            });
          }
        } catch (err) {
          // Fallback simulated values for other wallets
          iniVal = 100.0;
          adheeVal = 150.0;
        }
      }

      setBalances({
        sol: parseFloat(solVal.toFixed(4)),
        ini: iniVal,
        adhee: adheeVal,
      });
    } catch (err) {
      console.error('Error fetching wallet balances:', err);
    }
  }, []);

  // Refresh both reserves and balances
  const refreshAllData = useCallback(() => {
    fetchReserves();
    if (isConnected && walletAddress) {
      fetchWalletBalances(walletAddress);
    }
  }, [fetchReserves, fetchWalletBalances, isConnected, walletAddress]);

  // Load reserves on mount, and set up automatic polling
  useEffect(() => {
    fetchReserves();
    const interval = setInterval(refreshAllData, 15000);
    return () => clearInterval(interval);
  }, [fetchReserves, refreshAllData]);

  // Connect Wallet Action
  const connectWallet = async (type) => {
    setIsConnecting(true);
    // Simulate slight loading latency for premium UX
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (type === 'demo') {
      setWalletType('demo');
      setWalletAddress(DEMO_WALLET_ADDRESS);
      setIsConnected(true);
      await fetchWalletBalances(DEMO_WALLET_ADDRESS);
    } else if (type === 'phantom') {
      // Check if Phantom extension is present
      if (window.solana && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect();
          const pubkey = resp.publicKey.toString();
          setWalletType('phantom');
          setWalletAddress(pubkey);
          setIsConnected(true);
          await fetchWalletBalances(pubkey);
        } catch (err) {
          console.error('Phantom Wallet connection rejected:', err);
        }
      } else {
        // Fallback: simulated Phantom connect
        setWalletType('phantom');
        // Generate a random-looking Solana address
        setWalletAddress('PhAnToM888888888888888888888888888888888888');
        setIsConnected(true);
        setBalances({ sol: 12.54, ini: 15.0, adhee: 30.0 });
      }
    }
    setIsConnecting(false);
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setWalletType(null);
    setWalletAddress(null);
    setIsConnected(false);
    setBalances({ sol: null, ini: null, adhee: null });
  };

  // Generate random Solana Transaction Signature
  const generateMockSignature = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let sig = '';
    for (let i = 0; i < 88; i++) {
      sig += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sig;
  };

  // Execute Swap (Local overlay transaction simulation)
  const executeSwap = async (fromToken, toToken, amountIn, amountOut) => {
    if (!isConnected) throw new Error('Wallet not connected');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const numIn = parseFloat(amountIn);
    const numOut = parseFloat(amountOut);

    // Update balances locally
    setBalances((prev) => {
      const next = { ...prev };
      if (fromToken === 'INI') next.ini = parseFloat((next.ini - numIn).toFixed(4));
      if (fromToken === 'ADHEE') next.adhee = parseFloat((next.adhee - numIn).toFixed(4));
      if (toToken === 'INI') next.ini = parseFloat((next.ini + numOut).toFixed(4));
      if (toToken === 'ADHEE') next.adhee = parseFloat((next.adhee + numOut).toFixed(4));
      return next;
    });

    // Update reserves locally (simulate pool liquidity changes)
    setReserves((prev) => {
      const next = { ...prev };
      if (fromToken === 'INI') {
        next.ini = parseFloat((next.ini + numIn).toFixed(4));
        next.adhee = parseFloat((next.adhee - numOut).toFixed(4));
      } else if (fromToken === 'ADHEE') {
        next.adhee = parseFloat((next.adhee + numIn).toFixed(4));
        next.ini = parseFloat((next.ini - numOut).toFixed(4));
      }
      next.k = parseFloat((next.ini * next.adhee).toFixed(4));
      return next;
    });

    // Log transaction
    const sig = generateMockSignature();
    const newTx = {
      id: Math.random().toString(),
      type: 'swap',
      pair: `${fromToken} → ${toToken}`,
      amountIn: `${numIn} ${fromToken}`,
      amountOut: `${numOut.toFixed(4)} ${toToken}`,
      signature: sig,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
    };

    setRecentTransactions((prev) => [newTx, ...prev]);
    return sig;
  };

  // Add Liquidity (Local overlay transaction simulation)
  const executeAddLiquidity = async (amountA, amountB) => {
    if (!isConnected) throw new Error('Wallet not connected');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const numA = parseFloat(amountA);
    const numB = parseFloat(amountB);

    // Deduct from wallet
    setBalances((prev) => ({
      ...prev,
      ini: parseFloat((prev.ini - numA).toFixed(4)),
      adhee: parseFloat((prev.adhee - numB).toFixed(4)),
    }));

    // Add to pool reserves
    setReserves((prev) => {
      const newIni = parseFloat((prev.ini + numA).toFixed(4));
      const newAdhee = parseFloat((prev.adhee + numB).toFixed(4));
      return {
        ini: newIni,
        adhee: newAdhee,
        k: parseFloat((newIni * newAdhee).toFixed(4)),
      };
    });

    // Log transaction
    const sig = generateMockSignature();
    const newTx = {
      id: Math.random().toString(),
      type: 'liquidity',
      pair: 'INI + ADHEE',
      amountIn: `${numA} INI`,
      amountOut: `${numB} ADHEE`,
      signature: sig,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
    };

    setRecentTransactions((prev) => [newTx, ...prev]);
    return sig;
  };

  return (
    <SolanaContext.Provider
      value={{
        isConnected,
        isConnecting,
        walletAddress,
        walletType,
        balances,
        reserves,
        isLoadingReserves,
        networkPing,
        recentTransactions,
        connectWallet,
        disconnectWallet,
        executeSwap,
        executeAddLiquidity,
        refreshReserves: fetchReserves,
      }}
    >
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};
