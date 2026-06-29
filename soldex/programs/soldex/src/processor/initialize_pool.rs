use anchor_lang::prelude::*;

use crate::contexts::InitializePool;

pub fn initialize_pool(ctx: Context<InitializePool>, fee_bps: u16) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Admin
    pool.authority = ctx.accounts.authority.key();

    // Token mints
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();

    // Vault authority PDA
    pool.vault_authority = ctx.accounts.vault_authority.key();

    // Vaults
    pool.vault_a = ctx.accounts.vault_a.key();
    pool.vault_b = ctx.accounts.vault_b.key();

    // LP mint will be created next milestone
    pool.lp_mint = ctx.accounts.lp_mint.key();

    pool.reserve_a = 0;
    pool.reserve_b = 0;

    // Pool configuration
    pool.fee_bps = fee_bps;
    pool.total_lp_supply = 0;
    pool.bump = ctx.bumps.vault_authority;
    pool.is_initialized = true;

    msg!("===============================");
    msg!("SOLDEX POOL INITIALIZED");
    msg!("Authority      : {}", pool.authority);
    msg!("Token A Mint   : {}", pool.token_a_mint);
    msg!("Token B Mint   : {}", pool.token_b_mint);
    msg!("Vault A        : {}", pool.vault_a);
    msg!("Vault B        : {}", pool.vault_b);
    msg!("Fee (bps)      : {}", pool.fee_bps);
    msg!("===============================");

    Ok(())
}
