use anchor_lang::prelude::*;

use crate::contexts::Swap;
use crate::error::SoldexError;
use crate::math::get_amount_out;
use crate::utils::{cpi_transfer_checked, get_vault_authority_seeds};

/// Swaps Token A for Token B (or vice versa) using the constant product model.
///
/// Accounts:
/// - user
/// - pool
/// - vault_authority
/// - mint_in
/// - mint_out
/// - vault_in
/// - vault_out
/// - user_token_in
/// - user_token_out
///
/// Arguments:
/// - amount_in
/// - minimum_amount_out
///
/// Returns:
/// Result<()>
///
/// Execution flow:
/// 1. Calculate the exact swap output with protocol fee deducted.
/// 2. Validate that output meets minimum expected slippage constraint.
/// 3. Transfer input token from user to pool vault.
/// 4. Transfer output token from pool vault to user, signed by vault authority.
/// 5. Safely update pool reserves.
pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
    if amount_in == 0 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    let pool = &ctx.accounts.pool;

    // Identify reserves based on input mint
    let (reserve_in, reserve_out) = if ctx.accounts.mint_in.key() == pool.token_a_mint {
        (pool.reserve_a, pool.reserve_b)
    } else {
        (pool.reserve_b, pool.reserve_a)
    };

    // Calculate output amount using Uniswap V2 formula
    let amount_out = get_amount_out(amount_in, reserve_in, reserve_out)?;

    // Slippage protection
    if amount_out < minimum_amount_out {
        return Err(error!(SoldexError::SlippageExceeded));
    }

    let token_program = ctx.accounts.token_program.to_account_info();

    // 1. Transfer 1: User Input Token -> Pool Vault (authority: User Signer)
    cpi_transfer_checked(
        token_program.clone(),
        ctx.accounts.user_token_in.to_account_info(),
        ctx.accounts.mint_in.to_account_info(),
        ctx.accounts.vault_in.to_account_info(),
        ctx.accounts.user.to_account_info(),
        amount_in,
        ctx.accounts.mint_in.decimals,
        &[],
    )?;

    // 2. Transfer 2: Pool Vault -> User Output Token (authority: vault_authority PDA signer)
    let pool_key = pool.key();
    let bump = pool.bump;
    let seeds = get_vault_authority_seeds(&pool_key, &bump);
    let signer_seeds = &[&seeds[..]];

    cpi_transfer_checked(
        token_program,
        ctx.accounts.vault_out.to_account_info(),
        ctx.accounts.mint_out.to_account_info(),
        ctx.accounts.user_token_out.to_account_info(),
        ctx.accounts.vault_authority.to_account_info(),
        amount_out,
        ctx.accounts.mint_out.decimals,
        signer_seeds,
    )?;

    // 3. Update pool reserve counts
    let pool_mut = &mut ctx.accounts.pool;
    if ctx.accounts.mint_in.key() == pool_mut.token_a_mint {
        pool_mut.reserve_a = pool_mut
            .reserve_a
            .checked_add(amount_in)
            .ok_or(error!(SoldexError::MathOverflow))?;
        pool_mut.reserve_b = pool_mut
            .reserve_b
            .checked_sub(amount_out)
            .ok_or(error!(SoldexError::MathOverflow))?;
    } else {
        pool_mut.reserve_b = pool_mut
            .reserve_b
            .checked_add(amount_in)
            .ok_or(error!(SoldexError::MathOverflow))?;
        pool_mut.reserve_a = pool_mut
            .reserve_a
            .checked_sub(amount_out)
            .ok_or(error!(SoldexError::MathOverflow))?;
    }

    msg!("==============================");
    msg!("SWAP SUCCESSFUL");
    msg!(
        "Direction     : {} -> {}",
        ctx.accounts.mint_in.key(),
        ctx.accounts.mint_out.key()
    );
    msg!("Amount In     : {}", amount_in);
    msg!("Amount Out    : {}", amount_out);
    msg!("New Reserve A : {}", pool_mut.reserve_a);
    msg!("New Reserve B : {}", pool_mut.reserve_b);
    msg!("==============================");

    Ok(())
}
