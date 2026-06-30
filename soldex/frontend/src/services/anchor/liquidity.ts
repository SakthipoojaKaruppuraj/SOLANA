import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

const ensureInstruction = (program: Program, instructionName: string) => {
  const instructions = (program.idl.instructions as Array<{ name: string }> | undefined) ?? [];
  const variants = [instructionName, instructionName.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
  const exists = instructions.some((instruction) => variants.includes(instruction.name));

  if (!exists) {
    throw new Error(
      `The connected program ${program.programId.toBase58()} does not expose the ${instructionName} instruction. Rebuild/deploy the program and ensure VITE_PROGRAM_ID points to the same address.`
    );
  }
};

export const depositLiquidity = async (
  program: Program,
  poolAddress: PublicKey,
  vaultAuthority: PublicKey,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  vaultA: PublicKey,
  vaultB: PublicKey,
  lpMint: PublicKey,
  amountA: number,
  amountB: number
): Promise<string> => {
  ensureInstruction(program, "deposit_liquidity");

  const user = program.provider.publicKey;
  if (!user) throw new Error("Wallet not connected");

  const userTokenA = getAssociatedTokenAddressSync(tokenAMint, user);
  const userTokenB = getAssociatedTokenAddressSync(tokenBMint, user);
  const userLpToken = getAssociatedTokenAddressSync(lpMint, user);

  const preInstructions: TransactionInstruction[] = [];
  const connection = program.provider.connection;
  const userLpTokenInfo = await connection.getAccountInfo(userLpToken);
  
  if (!userLpTokenInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        user,
        userLpToken,
        user,
        lpMint
      )
    );
  }

  const tx = await program.methods
    .depositLiquidity(new BN(amountA.toString()), new BN(amountB.toString()))
    .accounts({
      user,
      pool: poolAddress,
      vaultAuthority,
      tokenAMint,
      tokenBMint,
      vaultA,
      vaultB,
      userTokenA,
      userTokenB,
      lpMint,
      userLpToken,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions(preInstructions)
    .rpc();

  return tx;
};

export const removeLiquidity = async (
  program: Program,
  poolAddress: PublicKey,
  vaultAuthority: PublicKey,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  vaultA: PublicKey,
  vaultB: PublicKey,
  lpMint: PublicKey,
  lpAmount: number
): Promise<string> => {
  ensureInstruction(program, "remove_liquidity");

  const user = program.provider.publicKey;
  if (!user) throw new Error("Wallet not connected");

  const userTokenA = getAssociatedTokenAddressSync(tokenAMint, user);
  const userTokenB = getAssociatedTokenAddressSync(tokenBMint, user);
  const userLpToken = getAssociatedTokenAddressSync(lpMint, user);

  const preInstructions: TransactionInstruction[] = [];
  const connection = program.provider.connection;

  const userTokenAInfo = await connection.getAccountInfo(userTokenA);
  if (!userTokenAInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        user,
        userTokenA,
        user,
        tokenAMint
      )
    );
  }

  const userTokenBInfo = await connection.getAccountInfo(userTokenB);
  if (!userTokenBInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        user,
        userTokenB,
        user,
        tokenBMint
      )
    );
  }

  const tx = await program.methods
    .removeLiquidity(new BN(lpAmount.toString()))
    .accounts({
      user,
      pool: poolAddress,
      vaultAuthority,
      lpMint,
      userLpToken,
      tokenAMint,
      tokenBMint,
      vaultA,
      vaultB,
      userTokenA,
      userTokenB,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions(preInstructions)
    .rpc();

  return tx;
};
