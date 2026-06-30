import { create } from "zustand";

export interface PoolInfo {
  address: string;
  tokenAMint: string;
  tokenBMint: string;
  vaultA: string;
  vaultB: string;
  lpMint: string;
  totalLpSupply: number;
  reserveA: number;
  reserveB: number;
  feeBps: number;
  userLpBalance?: number;
}

interface PoolState {
  pools: PoolInfo[];
  selectedPool: PoolInfo | null;
  setPools: (pools: PoolInfo[]) => void;
  setSelectedPool: (pool: PoolInfo | null) => void;
  updatePoolReserves: (address: string, reserveA: number, reserveB: number) => void;
}

export const usePoolStore = create<PoolState>((set) => ({
  pools: [],
  selectedPool: null,
  setPools: (pools) => set({ pools }),
  setSelectedPool: (pool) => set({ selectedPool: pool }),
  updatePoolReserves: (address, reserveA, reserveB) =>
    set((state) => ({
      pools: state.pools.map((p) => (p.address === address ? { ...p, reserveA, reserveB } : p)),
      selectedPool:
        state.selectedPool?.address === address
          ? { ...state.selectedPool, reserveA, reserveB }
          : state.selectedPool,
    })),
}));
