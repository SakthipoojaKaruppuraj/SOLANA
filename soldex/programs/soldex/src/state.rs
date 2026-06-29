use anchor_lang::prelude::*;

#[account]
pub struct Pool {
    /// Pool creator/admin
    pub authority: Pubkey,

    /// Token A mint
    pub token_a_mint: Pubkey,

    /// Token B mint
    pub token_b_mint: Pubkey,

    /// PDA owning vaults
    pub vault_authority: Pubkey,

    /// Vaults
    pub vault_a: Pubkey,
    pub vault_b: Pubkey,

    /// LP mint
    pub lp_mint: Pubkey,

    /// Current reserves
    pub reserve_a: u64,
    pub reserve_b: u64,

    /// Trading fee (basis points)
    pub fee_bps: u16,

    /// Total LP minted
    pub total_lp_supply: u64,

    /// PDA bump
    pub bump: u8,

    /// Initialized
    pub is_initialized: bool,
}

impl Pool {
    pub const LEN: usize =
          8      // discriminator
        + 32     // authority
        + 32     // token_a_mint
        + 32     // token_b_mint
        + 32     // vault_authority
        + 32     // vault_a
        + 32     // vault_b
        + 32     // lp_mint
        + 8      // reserve_a
        + 8      // reserve_b
        + 2      // fee_bps
        + 8      // total_lp_supply
        + 1      // bump
        + 1;     // initialized
}

#[account]
pub struct Position {
    /// Owner of this liquidity position
    pub owner: Pubkey,

    /// Pool this position belongs to
    pub pool: Pubkey,

    /// LP tokens owned
    pub lp_amount: u64,
}

impl Position {
    pub const LEN: usize =
          8   // discriminator
        + 32  // owner
        + 32  // pool
        + 8;  // lp_amount
}