use anchor_lang::prelude::*;

#[account]
pub struct Pool {
    /// Pool creator/admin
    pub authority: Pubkey,

    /// Token A mint
    pub token_a_mint: Pubkey,

    /// Token B mint
    pub token_b_mint: Pubkey,

    /// PDA that owns both vaults
    pub vault_authority: Pubkey,

    /// Token A vault
    pub vault_a: Pubkey,

    /// Token B vault
    pub vault_b: Pubkey,

    /// LP Token mint
    pub lp_mint: Pubkey,

    /// Trading fee (basis points)
    pub fee_bps: u16,

    /// Total LP tokens minted
    pub total_lp_supply: u64,

    /// PDA bump
    pub bump: u8,

    /// Whether the pool has been initialized
    pub is_initialized: bool,
}

impl Pool {
    pub const LEN: usize =
          8   // Anchor discriminator
        + 32  // authority
        + 32  // token_a_mint
        + 32  // token_b_mint
        + 32  // vault_authority
        + 32  // vault_a
        + 32  // vault_b
        + 32  // lp_mint
        + 2   // fee_bps
        + 8   // total_lp_supply
        + 1   // bump
        + 1;  // is_initialized
}