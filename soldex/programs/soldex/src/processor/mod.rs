use anchor_lang::prelude::*;

use crate::contexts::*;
use crate::state::*;

pub fn initialize_pool(
    ctx: Context<InitializePool>,
    fee_bps: u16,
) -> Result<()> {

    let pool = &mut ctx.accounts.pool;

    pool.authority = ctx.accounts.authority.key();
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();

    pool.vault_a = Pubkey::default();
    pool.vault_b = Pubkey::default();
    pool.lp_mint = Pubkey::default();

    pool.fee_bps = fee_bps;
    pool.bump = ctx.bumps.pool;

    pool.total_lp_supply = 0;
    pool.is_initialized = true;

    msg!("Pool initialized successfully");

    Ok(())
}