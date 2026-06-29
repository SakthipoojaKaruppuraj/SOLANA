use anchor_lang::prelude::*;

use crate::contexts::DepositLiquidity;
use crate::error::SoldexError;
use crate::math::calculate_lp_amount;
use crate::utils::{cpi_mint_to, cpi_transfer_checked, get_vault_authority_seeds};

/// Adds liquidity to the pool.
///
/// Accounts:
/// - user
/// - pool
/// - vault_authority
/// - token_a_mint
/// - token_b_mint
/// - vault_a
/// - vault_b
/// - user_token_a
/// - user_token_b
/// - lp_mint
/// - user_lp_token
///
/// Arguments:
/// - amount_a
/// - amount_b
///
/// Returns:
/// Result<()>
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
    let pool = &ctx.accounts.pool;

    // 1. Transfer Token A: User Token A ATA -> Vault A
    cpi_transfer_checked(
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.user_token_a.to_account_info(),
        ctx.accounts.token_a_mint.to_account_info(),
        ctx.accounts.vault_a.to_account_info(),
        ctx.accounts.user.to_account_info(),
        amount_a,
        ctx.accounts.token_a_mint.decimals,
        &[],
    )?;

    // 2. Transfer Token B: User Token B ATA -> Vault B
    cpi_transfer_checked(
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.user_token_b.to_account_info(),
        ctx.accounts.token_b_mint.to_account_info(),
        ctx.accounts.vault_b.to_account_info(),
        ctx.accounts.user.to_account_info(),
        amount_b,
        ctx.accounts.token_b_mint.decimals,
        &[],
    )?;

    // 3. Calculate LP share amount
    let lp_amount = calculate_lp_amount(
        amount_a,
        amount_b,
        pool.reserve_a,
        pool.reserve_b,
        pool.total_lp_supply,
    )?;

    if lp_amount == 0 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    // 4. Mint LP tokens: lp_mint -> user_lp_token (using vault_authority PDA signer)
    let pool_key = pool.key();
    let bump = pool.bump;
    let seeds = get_vault_authority_seeds(&pool_key, &bump);
    let signer_seeds = &[&seeds[..]];

    cpi_mint_to(
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.lp_mint.to_account_info(),
        ctx.accounts.user_lp_token.to_account_info(),
        ctx.accounts.vault_authority.to_account_info(),
        lp_amount,
        signer_seeds,
    )?;

    // 5. Update pool reserve counts and total LP supply
    let pool_mut = &mut ctx.accounts.pool;
    pool_mut.reserve_a = pool_mut
        .reserve_a
        .checked_add(amount_a)
        .ok_or(error!(SoldexError::MathOverflow))?;

    pool_mut.reserve_b = pool_mut
        .reserve_b
        .checked_add(amount_b)
        .ok_or(error!(SoldexError::MathOverflow))?;

    pool_mut.total_lp_supply = pool_mut
        .total_lp_supply
        .checked_add(lp_amount)
        .ok_or(error!(SoldexError::MathOverflow))?;

    msg!("==============================");
    msg!("DEPOSIT & MINT LP SUCCESSFUL");
    msg!("Amount A      : {}", amount_a);
    msg!("Amount B      : {}", amount_b);
    msg!("LP Minted     : {}", lp_amount);
    msg!("New Reserve A : {}", pool_mut.reserve_a);
    msg!("New Reserve B : {}", pool_mut.reserve_b);
    msg!("New LP Supply : {}", pool_mut.total_lp_supply);
    msg!("==============================");

    Ok(())
}
