import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWallet } from "./useWallet";
import { usePool } from "./usePool";
import { useTokens } from "./useTokens";
import { executeSwap } from "../services/anchor/swap";
import { usePoolStore } from "../stores/usePoolStore";
import { useTokenStore } from "../stores/useTokenStore";

export const useSwap = () => {
  const { program } = useWallet();
  const { refreshPool } = usePool();
  const { refreshBalances } = useTokens();
  const { selectedPool } = usePoolStore();
  const { tokenIn, tokenOut } = useTokenStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateAmountOut = useCallback(
    (amountInNum: number): number => {
      if (!selectedPool || amountInNum <= 0) return 0;
      
      const reserveA = selectedPool.reserveA / 10 ** 9;
      const reserveB = selectedPool.reserveB / 10 ** 9;

      if (reserveA === 0 || reserveB === 0) return 0;

      const isInA = tokenIn?.mint === selectedPool.tokenAMint;
      const reserveIn = isInA ? reserveA : reserveB;
      const reserveOut = isInA ? reserveB : reserveA;

      const amountInWithFee = amountInNum * 997;
      const numerator = amountInWithFee * reserveOut;
      const denominator = reserveIn * 1000 + amountInWithFee;

      return numerator / denominator;
    },
    [selectedPool, tokenIn]
  );

  const swapTokens = useCallback(
    async (amountInStr: string, slippagePercentStr: string) => {
      if (!program || !selectedPool || !tokenIn || !tokenOut) {
        throw new Error("Missing swap preconditions");
      }
      setLoading(true);
      setError(null);
      try {
        const amountInNum = parseFloat(amountInStr);
        if (isNaN(amountInNum) || amountInNum <= 0) throw new Error("Invalid input amount");

        const rawAmountIn = amountInNum * 10 ** 9;
        const expectedOutNum = calculateAmountOut(amountInNum);
        
        const slippage = parseFloat(slippagePercentStr);
        const minAmountOutNum = expectedOutNum * (1 - slippage / 100);
        const rawMinAmountOut = Math.floor(minAmountOutNum * 10 ** 9);

        const mintIn = new PublicKey(tokenIn.mint);
        const mintOut = new PublicKey(tokenOut.mint);
        const poolAddress = new PublicKey(selectedPool.address);
        
        const programId = program.programId;
        const [vaultAuthorityPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault-authority"), poolAddress.toBuffer()],
          programId
        );

        const isInA = tokenIn.mint === selectedPool.tokenAMint;
        
        const vaultA = getAssociatedTokenAddressSync(new PublicKey(selectedPool.tokenAMint), vaultAuthorityPDA, true);
        const vaultB = getAssociatedTokenAddressSync(new PublicKey(selectedPool.tokenBMint), vaultAuthorityPDA, true);
        const vaultInPDA = isInA ? vaultA : vaultB;
        const vaultOutPDA = isInA ? vaultB : vaultA;

        const tx = await executeSwap(
          program,
          poolAddress,
          vaultAuthorityPDA,
          mintIn,
          mintOut,
          vaultInPDA,
          vaultOutPDA,
          rawAmountIn,
          rawMinAmountOut
        );

        await refreshPool(poolAddress);
        await refreshBalances();

        return tx;
      } catch (e: any) {
        setError(e.message || "Swap execution failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [program, selectedPool, tokenIn, tokenOut, calculateAmountOut, refreshPool, refreshBalances]
  );

  return {
    loading,
    error,
    calculateAmountOut,
    swapTokens,
  };
};
