import { useConnection, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { config } from "../config";
import { getProgram } from "../services/anchor/program";

export const useWallet = () => {
  const { connection } = useConnection();
  const solanaWallet = useSolanaWallet();

  const program = useMemo(() => {
    if (!solanaWallet.connected || !solanaWallet.publicKey) return null;
    const anchorWallet = {
      publicKey: solanaWallet.publicKey,
      signTransaction: solanaWallet.signTransaction,
      signAllTransactions: solanaWallet.signAllTransactions,
    };
    return getProgram(connection, anchorWallet, config.programId);
  }, [connection, solanaWallet]);

  return {
    connection,
    publicKey: solanaWallet.publicKey,
    wallet: solanaWallet,
    connected: solanaWallet.connected,
    program,
  };
};
