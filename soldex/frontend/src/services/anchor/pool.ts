import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface OnChainPoolState {
  address: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  vaultAuthority: PublicKey;
  vaultA: PublicKey;
  vaultB: PublicKey;
  lpMint: PublicKey;
  reserveA: number;
  reserveB: number;
  feeBps: number;
  totalLpSupply: number;
  isInitialized: boolean;
}

export const fetchPoolState = async (
  program: Program,
  poolAddress: PublicKey
): Promise<OnChainPoolState | null> => {
  try {
    const state: any = await (program.account as any).pool.fetch(poolAddress);
    // Anchor v1.0 IDL fields are in snake_case
    return {
      address: poolAddress,
      tokenAMint: state.token_a_mint ?? state.tokenAMint,
      tokenBMint: state.token_b_mint ?? state.tokenBMint,
      vaultAuthority: state.vault_authority ?? state.vaultAuthority,
      vaultA: state.vault_a ?? state.vaultA,
      vaultB: state.vault_b ?? state.vaultB,
      lpMint: state.lp_mint ?? state.lpMint,
      reserveA: (state.reserve_a ?? state.reserveA).toNumber(),
      reserveB: (state.reserve_b ?? state.reserveB).toNumber(),
      feeBps: state.fee_bps ?? state.feeBps,
      totalLpSupply: (state.total_lp_supply ?? state.totalLpSupply).toNumber(),
      isInitialized: state.is_initialized ?? state.isInitialized,
    };
  } catch (e) {
    console.error("Error fetching pool state:", e);
    return null;
  }
};

export const fetchAllPools = async (program: Program): Promise<OnChainPoolState[]> => {
  try {
    const accounts = await (program.account as any).pool.all();
    return accounts.map((acc: any) => {
      const state: any = acc.account;
      // Anchor v1.0 IDL fields are in snake_case
      return {
        address: acc.publicKey,
        tokenAMint: state.token_a_mint ?? state.tokenAMint,
        tokenBMint: state.token_b_mint ?? state.tokenBMint,
        vaultAuthority: state.vault_authority ?? state.vaultAuthority,
        vaultA: state.vault_a ?? state.vaultA,
        vaultB: state.vault_b ?? state.vaultB,
        lpMint: state.lp_mint ?? state.lpMint,
        reserveA: (state.reserve_a ?? state.reserveA).toNumber(),
        reserveB: (state.reserve_b ?? state.reserveB).toNumber(),
        feeBps: state.fee_bps ?? state.feeBps,
        totalLpSupply: (state.total_lp_supply ?? state.totalLpSupply).toNumber(),
        isInitialized: state.is_initialized ?? state.isInitialized,
      };
    });
  } catch (e) {
    console.error("Error fetching all pools:", e);
    return [];
  }
};

export const initializePool = async (
  program: Program,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  feeBps: number,
  poolPDA: PublicKey,
  vaultAuthorityPDA: PublicKey,
  lpMintPDA: PublicKey,
  vaultA: PublicKey,
  vaultB: PublicKey,
  tokenProgram: PublicKey,
  associatedTokenProgram: PublicKey,
  systemProgram: PublicKey
): Promise<string> => {
  try {
    console.log("Program ID:", program.programId.toBase58());
    console.log("Available methods:", Object.keys(program.methods));

    const authority = program.provider.wallet?.publicKey ?? program.provider.publicKey;
    if (!authority) {
      throw new Error("Wallet not connected");
    }

    const tx = await program.methods
      .initializePool(feeBps)
      .accounts({
        authority,
        tokenAMint,
        tokenBMint,
        pool: poolPDA,
        vaultAuthority: vaultAuthorityPDA,
        lpMint: lpMintPDA,
        vaultA,
        vaultB,
        tokenProgram,
        associatedTokenProgram,
        systemProgram,
      })
      .rpc();

    console.log("Initialize Pool TX:", tx);

    return tx;
  } catch (e) {
    console.error("FULL ERROR:", e);
    throw e;
  }
};
