import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "../../idl/soldex.json";
import { config } from "../../config";

const withProgramId = (programId: PublicKey) => ({
  ...idl,
  address: programId.toBase58(),
});

export const getProgram = (
  connection: Connection,
  wallet: any,
  programId: PublicKey = config.programId
) => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  return new Program(withProgramId(programId) as any, provider);
};

export const derivePoolPDA = (
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  programId: PublicKey
): PublicKey => {
  const [poolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), tokenAMint.toBuffer(), tokenBMint.toBuffer()],
    programId
  );

  return poolPDA;
};

export const deriveVaultAuthorityPDA = (
  poolPDA: PublicKey,
  programId: PublicKey
): PublicKey => {
  const [vaultAuthorityPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-authority"), poolPDA.toBuffer()],
    programId
  );

  return vaultAuthorityPDA;
};

export const deriveLPMintPDA = (
  poolPDA: PublicKey,
  programId: PublicKey
): PublicKey => {
  const [lpMintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("lp-mint"), poolPDA.toBuffer()],
    programId
  );

  return lpMintPDA;
};