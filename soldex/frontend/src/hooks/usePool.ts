import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { useWallet } from "./useWallet";
import { usePoolStore } from "../stores/usePoolStore";
import { config } from "../config";
import {
  derivePoolPDA,
  deriveVaultAuthorityPDA,
  deriveLPMintPDA,
} from "../services/anchor/program";
import {
  fetchPoolState,
  fetchAllPools,
  initializePool as initializePoolService,
} from "../services/anchor/pool";

export const usePool = () => {
  const { program } = useWallet();
  const { setPools, setSelectedPool } = usePoolStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActivePDAs = useCallback((tokenAMint: PublicKey, tokenBMint: PublicKey) => {
    const programId = config.programId;
    const poolPDA = derivePoolPDA(tokenAMint, tokenBMint, programId);
    const vaultAuthorityPDA = deriveVaultAuthorityPDA(poolPDA, programId);
    const lpMintPDA = deriveLPMintPDA(poolPDA, programId);
    
    const vaultA = getAssociatedTokenAddressSync(tokenAMint, vaultAuthorityPDA, true);
    const vaultB = getAssociatedTokenAddressSync(tokenBMint, vaultAuthorityPDA, true);
    
    return {
      poolPDA,
      vaultAuthorityPDA,
      lpMintPDA,
      vaultA,
      vaultB,
    };
  }, []);

  const refreshPool = useCallback(
    async (poolAddress: PublicKey) => {
      if (!program) return null;
      setLoading(true);
      setError(null);
      try {
        const state = await fetchPoolState(program, poolAddress);
        if (state) {
          setSelectedPool({
            address: state.address.toBase58(),
            tokenAMint: state.tokenAMint.toBase58(),
            tokenBMint: state.tokenBMint.toBase58(),
            vaultA: state.vaultA.toBase58(),
            vaultB: state.vaultB.toBase58(),
            reserveA: state.reserveA,
            reserveB: state.reserveB,
            lpMint: state.lpMint.toBase58(),
            totalLpSupply: state.totalLpSupply,
            feeBps: state.feeBps,
          });
        }
        return state;
      } catch (e: any) {
        setError(e.message || "Failed to fetch pool state");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [program, setSelectedPool]
  );

  const refreshAll = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    setError(null);
    try {
      const states = await fetchAllPools(program);
      const mapped = states.map((state) => ({
        address: state.address.toBase58(),
        tokenAMint: state.tokenAMint.toBase58(),
        tokenBMint: state.tokenBMint.toBase58(),
        vaultA: state.vaultA.toBase58(),
        vaultB: state.vaultB.toBase58(),
        reserveA: state.reserveA,
        reserveB: state.reserveB,
        lpMint: state.lpMint.toBase58(),
        totalLpSupply: state.totalLpSupply,
        feeBps: state.feeBps,
      }));
      setPools(mapped);

      // Auto-select first pool and persist to localStorage if not already saved
      if (mapped.length > 0 && !localStorage.getItem("soldex_pool")) {
        const first = mapped[0];
        setSelectedPool(first);
        localStorage.setItem("soldex_pool", first.address);
        localStorage.setItem("soldex_mint_a", first.tokenAMint);
        localStorage.setItem("soldex_mint_b", first.tokenBMint);
        console.log("[usePool] Auto-discovered pool:", first.address);
      } else if (mapped.length > 0) {
        // If pool addr already in localStorage, just update selected pool in store
        const saved = localStorage.getItem("soldex_pool");
        const match = mapped.find((p) => p.address === saved) ?? mapped[0];
        setSelectedPool(match);
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch all pools");
    } finally {
      setLoading(false);
    }
  }, [program, setPools, setSelectedPool]);

  const createPool = useCallback(
    async (tokenAMintStr: string, tokenBMintStr: string, feeBps: number) => {
      if (!program) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      try {
        const tokenAMint = new PublicKey(tokenAMintStr);
        const tokenBMint = new PublicKey(tokenBMintStr);

        const pdas = getActivePDAs(tokenAMint, tokenBMint);
        const existing = await fetchPoolState(program, pdas.poolPDA);
        if (existing?.isInitialized) {
          throw new Error("This pool has already been initialized. Choose a new token pair or use the existing pool.");
        }

        const tx = await initializePoolService(
          program,
          tokenAMint,
          tokenBMint,
          feeBps,
          pdas.poolPDA,
          pdas.vaultAuthorityPDA,
          pdas.lpMintPDA,
          pdas.vaultA,
          pdas.vaultB,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
          SystemProgram.programId
        );

        localStorage.setItem("soldex_mint_a", tokenAMintStr);
        localStorage.setItem("soldex_mint_b", tokenBMintStr);
        localStorage.setItem("soldex_pool", pdas.poolPDA.toBase58());

        await refreshPool(pdas.poolPDA);
        await refreshAll();

        return {
          poolAddress: pdas.poolPDA.toBase58(),
          signature: tx,
        };
      } catch (e: any) {
        setError(e.message || "Failed to create pool");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [program, getActivePDAs, refreshPool, refreshAll]
  );

  return {
    loading,
    error,
    createPool,
    refreshPool,
    refreshAll,
    getActivePDAs,
  };
};
