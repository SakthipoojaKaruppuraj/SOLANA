import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction
} from "@solana/spl-token";

export const createMintAccount = async (
  connection: Connection,
  wallet: any
): Promise<string> => {
  const userPublicKey = wallet.publicKey;
  if (!userPublicKey) throw new Error("Wallet not connected");

  const mintKeypair = Keypair.generate();
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: userPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(
      mintKeypair.publicKey,
      9,
      userPublicKey,
      userPublicKey,
      TOKEN_PROGRAM_ID
    )
  );

  const signature = await wallet.sendTransaction(tx, connection, {
    signers: [mintKeypair],
  });
  
  await connection.confirmTransaction(signature, "confirmed");
  return mintKeypair.publicKey.toBase58();
};

export const mintTokensToUser = async (
  connection: Connection,
  wallet: any,
  mintAddress: PublicKey,
  amount: number
): Promise<string> => {
  const userPublicKey = wallet.publicKey;
  if (!userPublicKey) throw new Error("Wallet not connected");

  const userATA = getAssociatedTokenAddressSync(mintAddress, userPublicKey);
  const tx = new Transaction();

  const accountInfo = await connection.getAccountInfo(userATA);
  if (!accountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        userPublicKey,
        userATA,
        userPublicKey,
        mintAddress
      )
    );
  }

  tx.add(
    createMintToInstruction(
      mintAddress,
      userATA,
      userPublicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
};

export const fetchTokenBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  mintAddress: PublicKey
): Promise<number> => {
  try {
    const userATA = getAssociatedTokenAddressSync(mintAddress, walletAddress);
    const balanceResponse = await connection.getTokenAccountBalance(userATA);
    return balanceResponse.value.uiAmount || 0;
  } catch {
    return 0;
  }
};

export const fetchSolBalance = async (
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> => {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance / 1e9;
  } catch {
    return 0;
  }
};
