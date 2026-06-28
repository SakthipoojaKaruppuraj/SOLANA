use anchor_lang::prelude::*;

#[error_code]
pub enum SoldexError {
    #[msg("Invalid token mint")]
    InvalidTokenMint,

    #[msg("Invalid vault account")]
    InvalidVault,

    #[msg("Invalid LP mint")]
    InvalidLpMint,

    #[msg("Invalid vault authority")]
    InvalidVaultAuthority,

    #[msg("Pool already initialized")]
    PoolAlreadyInitialized,

    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,

    #[msg("Slippage exceeded")]
    SlippageExceeded,

    #[msg("Math overflow")]
    MathOverflow,
}