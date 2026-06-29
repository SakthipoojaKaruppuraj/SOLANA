use anchor_lang::prelude::*;

/// Error codes returned by the SOLDex AMM program instructions.
#[error_code]
pub enum SoldexError {
    /// Returned when a provided token mint does not match the pool's token mint.
    #[msg("Invalid token mint")]
    InvalidTokenMint,

    /// Returned when a provided vault account does not match the pool's vault account.
    #[msg("Invalid vault account")]
    InvalidVault,

    /// Returned when a provided LP mint does not match the pool's LP mint account.
    #[msg("Invalid LP mint")]
    InvalidLpMint,

    /// Returned when a provided vault authority does not match the pool's vault authority PDA.
    #[msg("Invalid vault authority")]
    InvalidVaultAuthority,

    /// Returned when trying to initialize an already initialized pool.
    #[msg("Pool already initialized")]
    PoolAlreadyInitialized,

    /// Returned when there is insufficient liquidity or the computed LP amount is zero.
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,

    /// Returned when the output amount is less than the user's minimum expected output.
    #[msg("Slippage exceeded")]
    SlippageExceeded,

    /// Returned when checked math operations overflow, underflow, or divide by zero.
    #[msg("Math overflow")]
    MathOverflow,
}
