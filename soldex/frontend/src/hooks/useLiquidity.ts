import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "./useWallet";
import { usePool } from "./usePool";
import { useTokens } from "./useTokens";
import { depositLiquidity, removeLiquidity } from "../services/anchor/liquidity";
import { usePoolStore } from "../stores/usePoolStore";

export const useLiquidity = () => {
  const { program } = useWallet();
  const { refreshPool } = usePool();
  const { refreshBalances } = useTokens();
  const { selectedPool } = usePoolStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLiquidity = useCallback(
    async (amountAStr: string, amountBStr: string) => {
      if (!program || !selectedPool) {
        throw new Error("Missing liquidity preconditions");
      }
      setLoading(true);
      setError(null);
      try {
        const amountA = parseFloat(amountAStr);
        const amountB = parseFloat(amountBStr);
        if (isNaN(amountA) || amountA <= 0 || isNaN(amountB) || amountB <= 0) {
          throw new Error("Invalid amounts provided");
        }

        const rawAmountA = amountA * 10 ** 9;
        const rawAmountB = amountB * 10 ** 9;

        const poolAddress = new PublicKey(selectedPool.address);
        const tokenAMint = new PublicKey(selectedPool.tokenAMint);
        const tokenBMint = new PublicKey(selectedPool.tokenBMint);
        const lpMint = new PublicKey(selectedPool.lpMint);

        const programId = program.programId;
        const [vaultAuthorityPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault-authority"), poolAddress.toBuffer()],
          programId
        );

        const vaultA = getAssociatedTokenAddressSync(tokenAMint, vaultAuthorityPDA, true);
        const vaultB = getAssociatedTokenAddressSync(tokenBMint, vaultAuthorityPDA, true);

        const tx = await depositLiquidity(
          program,
          poolAddress,
          vaultAuthorityPDA,
          tokenAMint,
          tokenBMint,
          vaultA,
          vaultB,
          lpMint,
          rawAmountA,
          rawAmountB
        );

        await refreshPool(poolAddress);
        await refreshBalances();

        return tx;
      } catch (e: any) {
        setError(e.message || "Failed to add liquidity");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [program, selectedPool, refreshPool, refreshBalances]
  );

  const withdrawLiquidity = useCallback(
    async (lpAmountStr: string) => {
      if (!program || !selectedPool) {
        throw new Error("Missing liquidity preconditions");
      }
      setLoading(true);
      setError(null);
      try {
        const lpAmount = parseFloat(lpAmountStr);
        if (isNaN(lpAmount) || lpAmount <= 0) {
          throw new Error("Invalid LP amount");
        }

        const rawLpAmount = lpAmount * 10 ** 9;

        const poolAddress = new PublicKey(selectedPool.address);
        const tokenAMint = new PublicKey(selectedPool.tokenAMint);
        const tokenBMint = new PublicKey(selectedPool.tokenBMint);
        const lpMint = new PublicKey(selectedPool.lpMint);

        const programId = program.programId;
        const [vaultAuthorityPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault-authority"), poolAddress.toBuffer()],
          programId
        );

        const vaultA = getAssociatedTokenAddressSync(tokenAMint, vaultAuthorityPDA, true);
        const vaultB = getAssociatedTokenAddressSync(tokenBMint, vaultAuthorityPDA, true);

        const tx = await removeLiquidity(
          program,
          poolAddress,
          vaultAuthorityPDA,
          tokenAMint,
          tokenBMint,
          vaultA,
          vaultB,
          lpMint,
          rawLpAmount
        );

        await refreshPool(poolAddress);
        await refreshBalances();

        return tx;
      } catch (e: any) {
        setError(e.message || "Failed to remove liquidity");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [program, selectedPool, refreshPool, refreshBalances]
  );

  return {
    loading,
    error,
    addLiquidity,
    withdrawLiquidity,
  };
};
