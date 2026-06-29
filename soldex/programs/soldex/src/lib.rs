use anchor_lang::prelude::*;

pub mod constants;
pub mod contexts;
pub mod error;
pub mod math;
pub mod processor;
pub mod state;
pub mod utils;

use contexts::*;

declare_id!("8KSsmmLyR35acaVM9o9EiQgYyV3PFrGKqzYLCcck8qSH");

/// The SOLDex constant product AMM program.
#[program]
pub mod soldex {
    use super::*;

    /// Initializes a new liquidity pool.
    ///
    /// Purpose:
    /// Sets up pool configuration, registers the token A/B mints and vaults, and registers the LP token mint.
    ///
    /// Accounts:
    /// - `authority`: The pool creator / admin paying for setup fees.
    /// - `token_a_mint` / `token_b_mint`: The token mints for the pool trading pair.
    /// - `pool`: The pool PDA derived from the mint keys.
    /// - `vault_authority`: The PDA acting as owner/authority of vaults and LP mints.
    /// - `lp_mint`: The LP mint created for providers of the pool.
    /// - `vault_a` / `vault_b`: Mints associated token accounts owned by vault authority.
    /// - `token_program`: SPL Token program interface.
    /// - `associated_token_program`: Associated Token program.
    /// - `system_program`: System program.
    ///
    /// Arguments:
    /// - `fee_bps`: The trading fee in basis points (e.g., 30 = 0.30%).
    ///
    /// Returns:
    /// - `Result<()>`: Ok if pool initialization succeeds.
    ///
    /// Execution flow:
    /// 1. Initialize the `pool` account parameters with the token mints, vault keys, and LP mint.
    /// 2. Set reserve values and fee configuration.
    pub fn initialize_pool(ctx: Context<InitializePool>, fee_bps: u16) -> Result<()> {
        processor::initialize_pool(ctx, fee_bps)
    }

    /// Deposits liquidity into the pool atomically and mints LP tokens to the depositor.
    ///
    /// Purpose:
    /// Allows a user to provide liquidity to the pool, adding Token A and Token B to the reserves
    /// and receiving LP tokens representing their pool share in return.
    ///
    /// Accounts:
    /// - `user`: Signer providing liquidity.
    /// - `pool`: The pool account.
    /// - `vault_authority`: PDA owner of the pool vaults.
    /// - `token_a_mint` / `token_b_mint`: Mint accounts of the pool pair.
    /// - `vault_a` / `vault_b`: The pool's token vault accounts.
    /// - `user_token_a` / `user_token_b`: User's source token accounts.
    /// - `lp_mint`: The LP mint account.
    /// - `user_lp_token`: User's destination LP token account.
    /// - `token_program`: SPL Token program interface.
    ///
    /// Arguments:
    /// - `amount_a`: Amount of Token A to deposit.
    /// - `amount_b`: Amount of Token B to deposit.
    ///
    /// Returns:
    /// - `Result<()>`: Ok if deposit and LP minting succeed.
    ///
    /// Execution flow:
    /// 1. Transfer Token A and Token B from user to pool vaults.
    /// 2. Compute the LP share amount to mint.
    /// 3. Mint LP tokens to the user's destination LP account.
    /// 4. Safely update pool reserves and total LP supply.
    pub fn deposit_liquidity(
        ctx: Context<DepositLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        processor::deposit_liquidity(ctx, amount_a, amount_b)
    }

    /// Removes liquidity from the pool and returns Token A and Token B back to the user.
    ///
    /// Purpose:
    /// Redeems user LP tokens, burning them, and returning the user's proportional share of pool reserves.
    ///
    /// Accounts:
    /// - `user`: Signer removing liquidity.
    /// - `pool`: The pool account.
    /// - `vault_authority`: PDA owner of the vaults.
    /// - `lp_mint`: The pool LP token mint.
    /// - `user_lp_token`: User's LP token source account.
    /// - `token_a_mint` / `token_b_mint`: Mint accounts of the pool pair.
    /// - `vault_a` / `vault_b`: The pool's token vault accounts.
    /// - `user_token_a` / `user_token_b`: User's destination token accounts.
    /// - `token_program`: SPL Token program interface.
    ///
    /// Arguments:
    /// - `lp_amount`: The amount of LP tokens to burn.
    ///
    /// Returns:
    /// - `Result<()>`: Ok if removal succeeds.
    ///
    /// Execution flow:
    /// 1. Burn user's LP tokens.
    /// 2. Compute proportional Token A and Token B shares.
    /// 3. Transfer Token A and Token B from pool vaults to user accounts.
    /// 4. Safely update pool reserves and total LP supply.
    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, lp_amount: u64) -> Result<()> {
        processor::remove_liquidity(ctx, lp_amount)
    }

    /// Swaps input tokens for output tokens using the constant product model (x * y = k).
    ///
    /// Purpose:
    /// Allows a user to trade Token A for Token B or vice-versa, with a 0.30% fee paid to the pool reserves.
    ///
    /// Accounts:
    /// - `user`: Signer executing the trade.
    /// - `pool`: The pool account.
    /// - `vault_authority`: PDA owner of the vaults.
    /// - `mint_in`: Mint of the incoming token.
    /// - `mint_out`: Mint of the outgoing token.
    /// - `vault_in`: Pool vault for the incoming token.
    /// - `vault_out`: Pool vault for the outgoing token.
    /// - `user_token_in`: User source token account.
    /// - `user_token_out`: User destination token account.
    /// - `token_program`: SPL Token program interface.
    ///
    /// Arguments:
    /// - `amount_in`: Amount of incoming tokens to trade.
    /// - `minimum_amount_out`: Minimum output tokens expected (slippage check).
    ///
    /// Returns:
    /// - `Result<()>`: Ok if swap succeeds.
    ///
    /// Execution flow:
    /// 1. Calculate the exact swap output with protocol fee deducted.
    /// 2. Validate that output meets minimum expected slippage constraint.
    /// 3. Transfer input token from user to pool vault.
    /// 4. Transfer output token from pool vault to user, signed by vault authority.
    /// 5. Safely update pool reserves.
    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        processor::swap(ctx, amount_in, minimum_amount_out)
    }
}
