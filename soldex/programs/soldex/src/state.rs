use anchor_lang::prelude::*;

/// Represents a constant-product token swap pool.
#[account]
pub struct Pool {
    /// Pool creator/admin authority.
    pub authority: Pubkey,

    /// Token A mint address.
    pub token_a_mint: Pubkey,

    /// Token B mint address.
    pub token_b_mint: Pubkey,

    /// PDA representing the owner/authority of the vaults.
    pub vault_authority: Pubkey,

    /// Token A vault ATA address.
    pub vault_a: Pubkey,

    /// Token B vault ATA address.
    pub vault_b: Pubkey,

    /// Pool LP token mint address.
    pub lp_mint: Pubkey,

    /// Current reserves of Token A in the pool.
    pub reserve_a: u64,

    /// Current reserves of Token B in the pool.
    pub reserve_b: u64,

    /// Pool trading fee configured in basis points (e.g. 30 = 0.30%).
    pub fee_bps: u16,

    /// Total outstanding supply of LP tokens minted.
    pub total_lp_supply: u64,

    /// PDA bump seed for the vault authority.
    pub bump: u8,

    /// Flag specifying if the pool has been initialized.
    pub is_initialized: bool,
}

impl Pool {
    /// Space size allocation for a `Pool` account.
    pub const LEN: usize = 8      // discriminator
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
        + 1; // initialized
}

/// Represents a user's liquidity position.
#[account]
pub struct Position {
    /// Owner of this liquidity position.
    pub owner: Pubkey,

    /// Pool this position belongs to.
    pub pool: Pubkey,

    /// LP tokens owned.
    pub lp_amount: u64,
}

impl Position {
    /// Space size allocation for a `Position` account.
    pub const LEN: usize = 8   // discriminator
        + 32  // owner
        + 32  // pool
        + 8; // lp_amount
}
