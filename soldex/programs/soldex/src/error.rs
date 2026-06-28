use anchor_lang::prelude::*;

#[error_code]
pub enum SoldexError {
    #[msg("Invalid token mint")]
    InvalidMint,

    #[msg("Pool already initialized")]
    PoolAlreadyInitialized,

    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,

    #[msg("Slippage exceeded")]
    SlippageExceeded,

    #[msg("Math overflow")]
    MathOverflow,
}