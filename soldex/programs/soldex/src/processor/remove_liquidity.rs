use anchor_lang::prelude::*;

use crate::contexts::RemoveLiquidity;
use crate::error::SoldexError;
use crate::utils::{cpi_burn, cpi_transfer_checked, get_vault_authority_seeds};

/// Removes liquidity from the pool.
///
/// Accounts:
/// - user
/// - pool
/// - vault_authority
/// - lp_mint
/// - user_lp_token
/// - token_a_mint
/// - token_b_mint
/// - vault_a
/// - vault_b
/// - user_token_a
/// - user_token_b
///
/// Arguments:
/// - lp_amount
///
/// Returns:
/// Result<()>
///
/// Execution flow:
/// 1. Burn user's LP tokens.
/// 2. Compute proportional Token A and Token B shares.
/// 3. Transfer Token A and Token B from pool vaults to user accounts.
/// 4. Safely update pool reserves and total LP supply.
pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, lp_amount: u64) -> Result<()> {
    if lp_amount == 0 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    let token_program = ctx.accounts.token_program.to_account_info();

    // 1. Burn user's LP tokens (signed by user)
    cpi_burn(
        token_program.clone(),
        ctx.accounts.lp_mint.to_account_info(),
        ctx.accounts.user_lp_token.to_account_info(),
        ctx.accounts.user.to_account_info(),
        lp_amount,
    )?;

    // 2. Calculate withdrawal share
    let pool = &ctx.accounts.pool;
    if pool.total_lp_supply == 0 {
        return Err(error!(SoldexError::MathOverflow));
    }

    let amount_a = (lp_amount as u128)
        .checked_mul(pool.reserve_a as u128)
        .ok_or(error!(SoldexError::MathOverflow))?
        .checked_div(pool.total_lp_supply as u128)
        .ok_or(error!(SoldexError::MathOverflow))? as u64;

    let amount_b = (lp_amount as u128)
        .checked_mul(pool.reserve_b as u128)
        .ok_or(error!(SoldexError::MathOverflow))?
        .checked_div(pool.total_lp_supply as u128)
        .ok_or(error!(SoldexError::MathOverflow))? as u64;

    // Reject withdrawals exceeding reserves
    if amount_a > pool.reserve_a || amount_b > pool.reserve_b {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    // 3. Transfer Token A and Token B: Vaults -> User
    let pool_key = pool.key();
    let bump = pool.bump;
    let seeds = get_vault_authority_seeds(&pool_key, &bump);
    let signer_seeds = &[&seeds[..]];

    // Transfer Token A
    cpi_transfer_checked(
        token_program.clone(),
        ctx.accounts.vault_a.to_account_info(),
        ctx.accounts.token_a_mint.to_account_info(),
        ctx.accounts.user_token_a.to_account_info(),
        ctx.accounts.vault_authority.to_account_info(),
        amount_a,
        ctx.accounts.token_a_mint.decimals,
        signer_seeds,
    )?;

    // Transfer Token B
    cpi_transfer_checked(
        token_program,
        ctx.accounts.vault_b.to_account_info(),
        ctx.accounts.token_b_mint.to_account_info(),
        ctx.accounts.user_token_b.to_account_info(),
        ctx.accounts.vault_authority.to_account_info(),
        amount_b,
        ctx.accounts.token_b_mint.decimals,
        signer_seeds,
    )?;

    // 4. Update reserves and total LP supply
    let pool_mut = &mut ctx.accounts.pool;
    pool_mut.reserve_a = pool_mut
        .reserve_a
        .checked_sub(amount_a)
        .ok_or(error!(SoldexError::MathOverflow))?;

    pool_mut.reserve_b = pool_mut
        .reserve_b
        .checked_sub(amount_b)
        .ok_or(error!(SoldexError::MathOverflow))?;

    pool_mut.total_lp_supply = pool_mut
        .total_lp_supply
        .checked_sub(lp_amount)
        .ok_or(error!(SoldexError::MathOverflow))?;

    msg!("==============================");
    msg!("REMOVE LIQUIDITY SUCCESSFUL");
    msg!("LP Burned     : {}", lp_amount);
    msg!("Returned A    : {}", amount_a);
    msg!("Returned B    : {}", amount_b);
    msg!("New Reserve A : {}", pool_mut.reserve_a);
    msg!("New Reserve B : {}", pool_mut.reserve_b);
    msg!("New LP Supply : {}", pool_mut.total_lp_supply);
    msg!("==============================");

    Ok(())
}
