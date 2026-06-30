import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "./useWallet";
import { useTokenStore, DEFAULT_TOKENS } from "../stores/useTokenStore";
import { config } from "../config";
import {
  createMintAccount,
  mintTokensToUser,
  fetchTokenBalance,
  fetchSolBalance,
} from "../services/anchor/tokens";
import { derivePoolPDA, deriveLPMintPDA } from "../services/anchor/program";

export const useTokens = () => {
  const { connection, publicKey, wallet } = useWallet();
  const { setTokens, updateBalance } = useTokenStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalances = useCallback(async () => {
    if (!connection || !publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const solBal = await fetchSolBalance(connection, publicKey);
      updateBalance("11111111111111111111111111111111", solBal);

      const tokenAMintStr = localStorage.getItem("soldex_mint_a");
      const tokenBMintStr = localStorage.getItem("soldex_mint_b");

      if (tokenAMintStr) {
        const balA = await fetchTokenBalance(connection, publicKey, new PublicKey(tokenAMintStr));
        updateBalance(tokenAMintStr, balA);
      }
      if (tokenBMintStr) {
        const balB = await fetchTokenBalance(connection, publicKey, new PublicKey(tokenBMintStr));
        updateBalance(tokenBMintStr, balB);
      }

      if (tokenAMintStr && tokenBMintStr) {
        const programId = config.programId;
        const poolPDA = derivePoolPDA(
          new PublicKey(tokenAMintStr),
          new PublicKey(tokenBMintStr),
          programId
        );
        const lpMintPDA = deriveLPMintPDA(poolPDA, programId);
        const lpBal = await fetchTokenBalance(connection, publicKey, lpMintPDA);
        updateBalance(lpMintPDA.toBase58(), lpBal);
      }
    } catch (e: any) {
      console.error("Error refreshing balances:", e);
      setError(e.message || "Failed to fetch balances");
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, updateBalance]);

  const setupTokens = useCallback(async () => {
    if (!connection || !wallet || !publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const mintA = await createMintAccount(connection, wallet);
      localStorage.setItem("soldex_mint_a", mintA);

      const mintB = await createMintAccount(connection, wallet);
      localStorage.setItem("soldex_mint_b", mintB);

      const programId = config.programId;
      const poolPDA = derivePoolPDA(
        new PublicKey(mintA),
        new PublicKey(mintB),
        programId
      );
      const lpMintPDA = deriveLPMintPDA(poolPDA, programId);

      const updatedTokens = [
        DEFAULT_TOKENS[0], // SOL
        {
          symbol: "SDXA",
          name: "SOLDex Token A",
          mint: mintA,
          decimals: 9,
          balance: 0,
        },
        {
          symbol: "SDXB",
          name: "SOLDex Token B",
          mint: mintB,
          decimals: 9,
          balance: 0,
        },
        {
          symbol: "SDX-LP",
          name: "SOLDex LP Token",
          mint: lpMintPDA.toBase58(),
          decimals: 9,
          balance: 0,
        },
      ];
      setTokens(updatedTokens);
      await refreshBalances();
    } catch (e: any) {
      setError(e.message || "Failed to setup tokens");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [connection, wallet, publicKey, setTokens, refreshBalances]);

  const faucetMint = useCallback(
    async (mintAddressStr: string, amount: number) => {
      if (!connection || !wallet) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      try {
        const rawAmount = amount * 10 ** 9;
        await mintTokensToUser(connection, wallet, new PublicKey(mintAddressStr), rawAmount);
        await refreshBalances();
      } catch (e: any) {
        setError(e.message || "Minting failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet, refreshBalances]
  );

  return {
    loading,
    error,
    refreshBalances,
    setupTokens,
    faucetMint,
  };
};
