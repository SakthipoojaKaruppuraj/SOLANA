import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

export const executeSwap = async (
  program: Program,
  poolAddress: PublicKey,
  vaultAuthority: PublicKey,
  mintIn: PublicKey,
  mintOut: PublicKey,
  vaultIn: PublicKey,
  vaultOut: PublicKey,
  amountIn: number,
  minimumAmountOut: number
): Promise<string> => {
  const user = program.provider.publicKey;
  if (!user) throw new Error("Wallet not connected");

  const userTokenIn = getAssociatedTokenAddressSync(mintIn, user);
  const userTokenOut = getAssociatedTokenAddressSync(mintOut, user);

  const preInstructions: TransactionInstruction[] = [];
  const connection = program.provider.connection;
  const userTokenOutInfo = await connection.getAccountInfo(userTokenOut);
  
  if (!userTokenOutInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        user,
        userTokenOut,
        user,
        mintOut
      )
    );
  }

  const tx = await program.methods
    .swap(new BN(amountIn.toString()), new BN(minimumAmountOut.toString()))
    .accounts({
      user,
      pool: poolAddress,
      vaultAuthority,
      mintIn,
      mintOut,
      vaultIn,
      vaultOut,
      userTokenIn,
      userTokenOut,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions(preInstructions)
    .rpc();

  return tx;
};
