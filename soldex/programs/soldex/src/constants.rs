/// Seed prefix for pool account derivation PDA.
pub const POOL_SEED: &[u8] = b"pool";

/// Seed prefix for the pool vault authority PDA.
pub const VAULT_AUTHORITY_SEED: &[u8] = b"vault-authority";

/// Seed prefix for the pool LP token mint PDA.
pub const LP_MINT_SEED: &[u8] = b"lp-mint";

/// Default pool trading fee in basis points (30 basis points represents 0.30%).
pub const DEFAULT_FEE_BPS: u16 = 30;
