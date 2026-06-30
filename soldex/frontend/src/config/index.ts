import { PublicKey } from "@solana/web3.js";

const getSavedKey = (key: string): PublicKey | null => {
  const value = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!value) return null;
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
};

/**
 * Application configurations loaded from environment variables or localStorage.
 */
export const config = {
  /**
   * Solana RPC node endpoint url.
   */
  solanaRpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com",

  /**
   * SOLDex Anchor Program ID.
   */
  programId: new PublicKey(
    import.meta.env.VITE_PROGRAM_ID || "8KSsmmLyR35acaVM9o9EiQgYyV3PFrGKqzYLCcck8qSH"
  ),

  /**
   * Active Token Mints and Pool addresses.
   * Developers can set these via the Dev Tools Page.
   */
  getTokenAMint: () => getSavedKey("soldex_mint_a"),
  getTokenBMint: () => getSavedKey("soldex_mint_b"),
  getPoolAddress: () => getSavedKey("soldex_pool"),
};

