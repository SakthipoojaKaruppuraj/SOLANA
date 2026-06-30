import { create } from "zustand";

export interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI?: string;
  balance?: number;
}

export const getInitialTokens = (): Token[] => {
  const savedMintA = typeof window !== "undefined" ? localStorage.getItem("soldex_mint_a") : null;
  const savedMintB = typeof window !== "undefined" ? localStorage.getItem("soldex_mint_b") : null;

  return [
    {
      symbol: "SOL",
      name: "Solana",
      mint: "11111111111111111111111111111111",
      decimals: 9,
      logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    },
    {
      symbol: "SDXA",
      name: "SOLDex Token A",
      mint: savedMintA || "7d1Z2s944o431V7789asdf234aYyTRW918",
      decimals: 9,
    },
    {
      symbol: "SDXB",
      name: "SOLDex Token B",
      mint: savedMintB || "8b2X1s833o321V6689asdf123aYyTRW817",
      decimals: 9,
    },
  ];
};

export const DEFAULT_TOKENS = getInitialTokens();

interface TokenState {
  tokens: Token[];
  tokenIn: Token | null;
  tokenOut: Token | null;
  setTokenIn: (token: Token) => void;
  setTokenOut: (token: Token) => void;
  updateBalance: (mint: string, balance: number) => void;
  setTokens: (tokens: Token[]) => void;
}

export const useTokenStore = create<TokenState>((set) => {
  const initial = getInitialTokens();
  return {
    tokens: initial,
    tokenIn: initial[0],
    tokenOut: initial[1],
    setTokenIn: (token) => set({ tokenIn: token }),
    setTokenOut: (token) => set({ tokenOut: token }),
    updateBalance: (mint, balance) =>
      set((state) => ({
        tokens: state.tokens.map((t) => (t.mint === mint ? { ...t, balance } : t)),
        tokenIn: state.tokenIn?.mint === mint ? { ...state.tokenIn, balance } : state.tokenIn,
        tokenOut: state.tokenOut?.mint === mint ? { ...state.tokenOut, balance } : state.tokenOut,
      })),
    setTokens: (tokens) => set({ tokens }),
  };
});
