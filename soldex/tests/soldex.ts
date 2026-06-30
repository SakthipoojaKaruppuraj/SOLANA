import * as anchor from "@anchor-lang/core";
import { Program } from "@coral-xyz/anchor";
import { Soldex } from "../target/types/soldex";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { expect } from "chai";
import * as token from "@solana/spl-token";

describe("soldex", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Soldex as Program<Soldex>;

  // Token Mints
  let mintA: PublicKey;
  let mintB: PublicKey;

  // Pool PDAs
  let poolPDA: PublicKey;
  let vaultAuthorityPDA: PublicKey;
  let lpMintPDA: PublicKey;

  // Pool Vaults
  let vaultA: PublicKey;
  let vaultB: PublicKey;

  // Keypairs for testing users
  const admin = Keypair.generate();
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  const charlie = Keypair.generate();

  // User Token accounts
  let aliceTokenA: PublicKey;
  let aliceTokenB: PublicKey;
  let aliceLpToken: PublicKey;

  let bobTokenA: PublicKey;
  let bobTokenB: PublicKey;
  let bobLpToken: PublicKey;

  let charlieTokenA: PublicKey;
  let charlieTokenB: PublicKey;
  let charlieLpToken: PublicKey;

  const decimals = 9;

  before(async () => {
    // Airdrop Sol to users
    await Promise.all(
      [admin, alice, bob, charlie].map(async (user) => {
        const sig = await provider.connection.requestAirdrop(
          user.publicKey,
          10 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig);
      })
    );

    // Create Token Mints
    mintA = await token.createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      decimals,
      Keypair.generate(),
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    mintB = await token.createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      decimals,
      Keypair.generate(),
      undefined,
      token.TOKEN_PROGRAM_ID
    );

    // Derive Pool PDAs
    [poolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
      program.programId
    );

    [vaultAuthorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault-authority"), poolPDA.toBuffer()],
      program.programId
    );

    [lpMintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp-mint"), poolPDA.toBuffer()],
      program.programId
    );

    // Associated Vault Accounts owned by vaultAuthorityPDA
    vaultA = token.getAssociatedTokenAddressSync(
      mintA,
      vaultAuthorityPDA,
      true,
      token.TOKEN_PROGRAM_ID
    );
    vaultB = token.getAssociatedTokenAddressSync(
      mintB,
      vaultAuthorityPDA,
      true,
      token.TOKEN_PROGRAM_ID
    );

    // Create User ATAs
    aliceTokenA = await token.createAssociatedTokenAccount(
      provider.connection,
      alice,
      mintA,
      alice.publicKey,
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    aliceTokenB = await token.createAssociatedTokenAccount(
      provider.connection,
      alice,
      mintB,
      alice.publicKey,
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    aliceLpToken = token.getAssociatedTokenAddressSync(
      lpMintPDA,
      alice.publicKey,
      false,
      token.TOKEN_PROGRAM_ID
    );

    bobTokenA = await token.createAssociatedTokenAccount(
      provider.connection,
      bob,
      mintA,
      bob.publicKey,
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    bobTokenB = await token.createAssociatedTokenAccount(
      provider.connection,
      bob,
      mintB,
      bob.publicKey,
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    bobLpToken = token.getAssociatedTokenAddressSync(
      lpMintPDA,
      bob.publicKey,
      false,
      token.TOKEN_PROGRAM_ID
    );

    charlieTokenA = await token.createAssociatedTokenAccount(
      provider.connection,
      charlie,
      mintA,
      charlie.publicKey,
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    charlieTokenB = await token.createAssociatedTokenAccount(
      provider.connection,
      charlie,
      mintB,
      charlie.publicKey,
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    charlieLpToken = token.getAssociatedTokenAddressSync(
      lpMintPDA,
      charlie.publicKey,
      false,
      token.TOKEN_PROGRAM_ID
    );

    // Mint initial tokens to users
    await token.mintTo(
      provider.connection,
      admin,
      mintA,
      aliceTokenA,
      admin,
      1000 * 10 ** decimals,
      [],
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    await token.mintTo(
      provider.connection,
      admin,
      mintB,
      aliceTokenB,
      admin,
      1000 * 10 ** decimals,
      [],
      undefined,
      token.TOKEN_PROGRAM_ID
    );

    await token.mintTo(
      provider.connection,
      admin,
      mintA,
      bobTokenA,
      admin,
      1000 * 10 ** decimals,
      [],
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    await token.mintTo(
      provider.connection,
      admin,
      mintB,
      bobTokenB,
      admin,
      1000 * 10 ** decimals,
      [],
      undefined,
      token.TOKEN_PROGRAM_ID
    );

    await token.mintTo(
      provider.connection,
      admin,
      mintA,
      charlieTokenA,
      admin,
      1000 * 10 ** decimals,
      [],
      undefined,
      token.TOKEN_PROGRAM_ID
    );
    await token.mintTo(
      provider.connection,
      admin,
      mintB,
      charlieTokenB,
      admin,
      1000 * 10 ** decimals,
      [],
      undefined,
      token.TOKEN_PROGRAM_ID
    );
  });

  // ==========================================
  // STAGE 1 – Core Functionality
  // ==========================================

  describe("Stage 1 - Core Functionality", () => {
    it("Test 1: Initialize Pool", async () => {
      const feeBps = 30; // 0.30%
      await program.methods
        .initializePool(feeBps)
        .accounts({
          authority: admin.publicKey,
          tokenAMint: mintA,
          tokenBMint: mintB,
          lpMint: lpMintPDA,
          vaultA: vaultA,
          vaultB: vaultB,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([admin])
        .rpc();

      const poolState = await program.account.pool.fetch(poolPDA);
      expect(poolState.isInitialized).to.be.true;
      expect(poolState.feeBps).to.equal(feeBps);
      expect(poolState.tokenAMint.toBase58()).to.equal(mintA.toBase58());
      expect(poolState.tokenBMint.toBase58()).to.equal(mintB.toBase58());
      expect(poolState.vaultA.toBase58()).to.equal(vaultA.toBase58());
      expect(poolState.vaultB.toBase58()).to.equal(vaultB.toBase58());
      expect(poolState.lpMint.toBase58()).to.equal(lpMintPDA.toBase58());
    });

    it("Test 2: Initial Liquidity (100 A, 100 B)", async () => {
      const depositA = new anchor.BN(100 * 10 ** decimals);
      const depositB = new anchor.BN(100 * 10 ** decimals);

      await token.createAssociatedTokenAccount(
        provider.connection,
        alice,
        lpMintPDA,
        alice.publicKey,
        undefined,
        token.TOKEN_PROGRAM_ID
      );

      await program.methods
        .depositLiquidity(depositA, depositB)
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          tokenAMint: mintA,
          tokenBMint: mintB,
          vaultA: vaultA,
          vaultB: vaultB,
          userTokenA: aliceTokenA,
          userTokenB: aliceTokenB,
          lpMint: lpMintPDA,
          userLpToken: aliceLpToken,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();

      const poolState = await program.account.pool.fetch(poolPDA);
      expect(poolState.reserveA.toString()).to.equal(depositA.toString());
      expect(poolState.reserveB.toString()).to.equal(depositB.toString());
      expect(poolState.totalLpSupply.toString()).to.equal(
        depositA.toString() // sqrt(100 * 100) = 100
      );

      const userLpAccount = await token.getAccount(
        provider.connection,
        aliceLpToken
      );
      expect(userLpAccount.amount.toString()).to.equal(depositA.toString());
    });

    it("Test 3: Second Liquidity Provider (50 A, 50 B)", async () => {
      const depositA = new anchor.BN(50 * 10 ** decimals);
      const depositB = new anchor.BN(50 * 10 ** decimals);

      await token.createAssociatedTokenAccount(
        provider.connection,
        bob,
        lpMintPDA,
        bob.publicKey,
        undefined,
        token.TOKEN_PROGRAM_ID
      );

      const poolBefore = await program.account.pool.fetch(poolPDA);

      await program.methods
        .depositLiquidity(depositA, depositB)
        .accounts({
          user: bob.publicKey,
          pool: poolPDA,
          tokenAMint: mintA,
          tokenBMint: mintB,
          vaultA: vaultA,
          vaultB: vaultB,
          userTokenA: bobTokenA,
          userTokenB: bobTokenB,
          lpMint: lpMintPDA,
          userLpToken: bobLpToken,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([bob])
        .rpc();

      const poolAfter = await program.account.pool.fetch(poolPDA);
      expect(poolAfter.reserveA.toString()).to.equal(
        poolBefore.reserveA.add(depositA).toString()
      );
      expect(poolAfter.reserveB.toString()).to.equal(
        poolBefore.reserveB.add(depositB).toString()
      );

      // proportional LP: 50 * 100 / 100 = 50
      const expectedLp = depositA
        .mul(poolBefore.totalLpSupply)
        .div(poolBefore.reserveA);
      expect(poolAfter.totalLpSupply.toString()).to.equal(
        poolBefore.totalLpSupply.add(expectedLp).toString()
      );

      const userLpAccount = await token.getAccount(
        provider.connection,
        bobLpToken
      );
      expect(userLpAccount.amount.toString()).to.equal(expectedLp.toString());
    });

    it("Test 4: Swap A -> B", async () => {
      const amountIn = new anchor.BN(10 * 10 ** decimals);
      const minAmountOut = new anchor.BN(1);

      const poolBefore = await program.account.pool.fetch(poolPDA);

      await program.methods
        .swap(amountIn, minAmountOut)
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          mintIn: mintA,
          mintOut: mintB,
          vaultIn: vaultA,
          vaultOut: vaultB,
          userTokenIn: aliceTokenA,
          userTokenOut: aliceTokenB,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();

      const poolAfter = await program.account.pool.fetch(poolPDA);
      expect(poolAfter.reserveA.toString()).to.equal(
        poolBefore.reserveA.add(amountIn).toString()
      );
      expect(poolAfter.reserveB.lt(poolBefore.reserveB)).to.be.true;
    });

    it("Test 5: Swap B -> A", async () => {
      const amountIn = new anchor.BN(10 * 10 ** decimals);
      const minAmountOut = new anchor.BN(1);

      const poolBefore = await program.account.pool.fetch(poolPDA);

      await program.methods
        .swap(amountIn, minAmountOut)
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          mintIn: mintB,
          mintOut: mintA,
          vaultIn: vaultB,
          vaultOut: vaultA,
          userTokenIn: aliceTokenB,
          userTokenOut: aliceTokenA,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();

      const poolAfter = await program.account.pool.fetch(poolPDA);
      expect(poolAfter.reserveB.toString()).to.equal(
        poolBefore.reserveB.add(amountIn).toString()
      );
      expect(poolAfter.reserveA.lt(poolBefore.reserveA)).to.be.true;
    });

    it("Test 6: Partial Withdrawal (Burn 50% LP)", async () => {
      const userLpAccountBefore = await token.getAccount(
        provider.connection,
        aliceLpToken
      );
      const burnAmount = userLpAccountBefore.amount / 2n;

      const poolBefore = await program.account.pool.fetch(poolPDA);

      await program.methods
        .removeLiquidity(new anchor.BN(burnAmount.toString()))
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          vaultAuthority: vaultAuthorityPDA,
          lpMint: lpMintPDA,
          userLpToken: aliceLpToken,
          tokenAMint: mintA,
          tokenBMint: mintB,
          vaultA: vaultA,
          vaultB: vaultB,
          userTokenA: aliceTokenA,
          userTokenB: aliceTokenB,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();

      const poolAfter = await program.account.pool.fetch(poolPDA);
      expect(poolAfter.totalLpSupply.toString()).to.equal(
        poolBefore.totalLpSupply
          .sub(new anchor.BN(burnAmount.toString()))
          .toString()
      );
    });

    it("Test 7: Full Withdrawal (Burn Remaining LP)", async () => {
      const userLpAlice = await token.getAccount(
        provider.connection,
        aliceLpToken
      );
      const userLpBob = await token.getAccount(
        provider.connection,
        bobLpToken
      );

      // Alice withdraws remaining
      await program.methods
        .removeLiquidity(new anchor.BN(userLpAlice.amount.toString()))
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          vaultAuthority: vaultAuthorityPDA,
          lpMint: lpMintPDA,
          userLpToken: aliceLpToken,
          tokenAMint: mintA,
          tokenBMint: mintB,
          vaultA: vaultA,
          vaultB: vaultB,
          userTokenA: aliceTokenA,
          userTokenB: aliceTokenB,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();

      // Bob withdraws remaining
      await program.methods
        .removeLiquidity(new anchor.BN(userLpBob.amount.toString()))
        .accounts({
          user: bob.publicKey,
          pool: poolPDA,
          vaultAuthority: vaultAuthorityPDA,
          lpMint: lpMintPDA,
          userLpToken: bobLpToken,
          tokenAMint: mintA,
          tokenBMint: mintB,
          vaultA: vaultA,
          vaultB: vaultB,
          userTokenA: bobTokenA,
          userTokenB: bobTokenB,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([bob])
        .rpc();

      const poolAfter = await program.account.pool.fetch(poolPDA);
      expect(poolAfter.reserveA.toNumber()).to.equal(0);
      expect(poolAfter.reserveB.toNumber()).to.equal(0);
      expect(poolAfter.totalLpSupply.toNumber()).to.equal(0);
    });
  });

  // ==========================================
  // STAGE 2 – Validation / Failures
  // ==========================================

  describe("Stage 2 - Validation", () => {
    // Setup pool reserves for validation tests
    before(async () => {
      const depositA = new anchor.BN(100 * 10 ** decimals);
      const depositB = new anchor.BN(100 * 10 ** decimals);
      await program.methods
        .depositLiquidity(depositA, depositB)
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          tokenAMint: mintA,
          tokenBMint: mintB,
          vaultA: vaultA,
          vaultB: vaultB,
          userTokenA: aliceTokenA,
          userTokenB: aliceTokenB,
          lpMint: lpMintPDA,
          userLpToken: aliceLpToken,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();
    });

    it("Expect failure: SlippageExceeded", async () => {
      const amountIn = new anchor.BN(1 * 10 ** decimals);
      // High minimum output to force failure
      const minAmountOut = new anchor.BN(10 * 10 ** decimals);

      try {
        await program.methods
          .swap(amountIn, minAmountOut)
          .accounts({
            user: alice.publicKey,
            pool: poolPDA,
            mintIn: mintA,
            mintOut: mintB,
            vaultIn: vaultA,
            vaultOut: vaultB,
            userTokenIn: aliceTokenA,
            userTokenOut: aliceTokenB,
            tokenProgram: token.TOKEN_PROGRAM_ID,
          })
          .signers([alice])
          .rpc();
        expect.fail("Should have failed with SlippageExceeded");
      } catch (err: any) {
        expect(err.message).to.include("SlippageExceeded");
      }
    });

    it("Expect failure: InvalidVault", async () => {
      const amountIn = new anchor.BN(1 * 10 ** decimals);
      const minAmountOut = new anchor.BN(1);

      try {
        await program.methods
          .swap(amountIn, minAmountOut)
          .accounts({
            user: alice.publicKey,
            pool: poolPDA,
            mintIn: mintA,
            mintOut: mintB,
            vaultIn: bobTokenA, // Wrong vault (valid token account but not the pool vault)
            vaultOut: vaultB,
            userTokenIn: aliceTokenA,
            userTokenOut: aliceTokenB,
            tokenProgram: token.TOKEN_PROGRAM_ID,
          })
          .signers([alice])
          .rpc();
        expect.fail("Should have failed with InvalidVault");
      } catch (err: any) {
        expect(err.message).to.include("InvalidVault");
      }
    });

    it("Expect failure: InvalidMint", async () => {
      const amountIn = new anchor.BN(1 * 10 ** decimals);
      const minAmountOut = new anchor.BN(1);

      try {
        await program.methods
          .swap(amountIn, minAmountOut)
          .accounts({
            user: alice.publicKey,
            pool: poolPDA,
            mintIn: lpMintPDA, // Wrong mint
            mintOut: mintB,
            vaultIn: vaultA,
            vaultOut: vaultB,
            userTokenIn: aliceTokenA,
            userTokenOut: aliceTokenB,
            tokenProgram: token.TOKEN_PROGRAM_ID,
          })
          .signers([alice])
          .rpc();
        expect.fail("Should have failed with InvalidTokenMint");
      } catch (err: any) {
        expect(err.message).to.include("InvalidTokenMint");
      }
    });

    it("Expect failure: Zero swap amount", async () => {
      try {
        await program.methods
          .swap(new anchor.BN(0), new anchor.BN(0))
          .accounts({
            user: alice.publicKey,
            pool: poolPDA,
            mintIn: mintA,
            mintOut: mintB,
            vaultIn: vaultA,
            vaultOut: vaultB,
            userTokenIn: aliceTokenA,
            userTokenOut: aliceTokenB,
            tokenProgram: token.TOKEN_PROGRAM_ID,
          })
          .signers([alice])
          .rpc();
        expect.fail("Should have failed with InsufficientLiquidity");
      } catch (err: any) {
        expect(err.message).to.include("InsufficientLiquidity");
      }
    });
  });

  // ==========================================
  // STAGE 3 – Advanced Logic & Stress Tests
  // ==========================================

  describe("Stage 3 - Advanced Tests", () => {
    it("Test 10: Swap Invariant (k_after >= k_before)", async () => {
      const amountIn = new anchor.BN(5 * 10 ** decimals);
      const minAmountOut = new anchor.BN(1);

      const poolBefore = await program.account.pool.fetch(poolPDA);
      const kBefore = poolBefore.reserveA.mul(poolBefore.reserveB);

      await program.methods
        .swap(amountIn, minAmountOut)
        .accounts({
          user: alice.publicKey,
          pool: poolPDA,
          mintIn: mintA,
          mintOut: mintB,
          vaultIn: vaultA,
          vaultOut: vaultB,
          userTokenIn: aliceTokenA,
          userTokenOut: aliceTokenB,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .signers([alice])
        .rpc();

      const poolAfter = await program.account.pool.fetch(poolPDA);
      const kAfter = poolAfter.reserveA.mul(poolAfter.reserveB);

      expect(kAfter.gte(kBefore)).to.be.true;
    });

    it("Test 11: Multi-user liquidity providers", async () => {
      const amountA = new anchor.BN(10 * 10 ** decimals);
      const amountB = new anchor.BN(10 * 10 ** decimals);

      // Create Charlie's LP token account
      await token.createAssociatedTokenAccount(
        provider.connection,
        charlie,
        lpMintPDA,
        charlie.publicKey,
        undefined,
        token.TOKEN_PROGRAM_ID
      );

      // Alice, Bob and Charlie add liquidity
      await Promise.all(
        [alice, bob, charlie].map(async (user, idx) => {
          let userATA_A = aliceTokenA;
          let userATA_B = aliceTokenB;
          let userLp = aliceLpToken;
          if (idx === 1) {
            userATA_A = bobTokenA;
            userATA_B = bobTokenB;
            userLp = bobLpToken;
          } else if (idx === 2) {
            userATA_A = charlieTokenA;
            userATA_B = charlieTokenB;
            userLp = charlieLpToken;
          }

          await program.methods
            .depositLiquidity(amountA, amountB)
            .accounts({
              user: user.publicKey,
              pool: poolPDA,
              tokenAMint: mintA,
              tokenBMint: mintB,
              vaultA: vaultA,
              vaultB: vaultB,
              userTokenA: userATA_A,
              userTokenB: userATA_B,
              lpMint: lpMintPDA,
              userLpToken: userLp,
              tokenProgram: token.TOKEN_PROGRAM_ID,
            })
            .signers([user])
            .rpc();
        })
      );

      const poolState = await program.account.pool.fetch(poolPDA);
      expect(poolState.reserveA.gt(new anchor.BN(0))).to.be.true;
    });

    it("Test 12: Stress Test (100 Randomized Swaps)", async () => {
      // Running 100 swaps is highly sufficient for on-chain local-validator tests
      // to avoid execution timeout (1000 transactions on local validator takes ~1-2 mins,
      // which often triggers mocha timeout).
      for (let i = 0; i < 100; i++) {
        // Swap sizes from 0.01 to 1 token
        const size = Math.floor(Math.random() * 99 + 1) / 100;
        const amountIn = new anchor.BN((size * 10 ** decimals).toString());
        const swapDirection = Math.random() > 0.5;

        const poolBefore = await program.account.pool.fetch(poolPDA);
        const kBefore = poolBefore.reserveA.mul(poolBefore.reserveB);

        if (swapDirection) {
          await program.methods
            .swap(amountIn, new anchor.BN(1))
            .accounts({
              user: alice.publicKey,
              pool: poolPDA,
              mintIn: mintA,
              mintOut: mintB,
              vaultIn: vaultA,
              vaultOut: vaultB,
              userTokenIn: aliceTokenA,
              userTokenOut: aliceTokenB,
              tokenProgram: token.TOKEN_PROGRAM_ID,
            })
            .signers([alice])
            .rpc();
        } else {
          await program.methods
            .swap(amountIn, new anchor.BN(1))
            .accounts({
              user: alice.publicKey,
              pool: poolPDA,
              mintIn: mintB,
              mintOut: mintA,
              vaultIn: vaultB,
              vaultOut: vaultA,
              userTokenIn: aliceTokenB,
              userTokenOut: aliceTokenA,
              tokenProgram: token.TOKEN_PROGRAM_ID,
            })
            .signers([alice])
            .rpc();
        }

        const poolAfter = await program.account.pool.fetch(poolPDA);
        const kAfter = poolAfter.reserveA.mul(poolAfter.reserveB);

        expect(poolAfter.reserveA.gt(new anchor.BN(0))).to.be.true;
        expect(poolAfter.reserveB.gt(new anchor.BN(0))).to.be.true;
        expect(kAfter.gte(kBefore)).to.be.true;
      }
    });
  });
});
