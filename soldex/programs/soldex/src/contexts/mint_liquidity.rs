#![allow(deprecated)]

use anchor_lang::prelude::*;

/// Context for the deprecated `mint_liquidity` instruction.
///
/// This context is kept for reference only and is no longer exposed by the program.
#[derive(Accounts)]
#[deprecated(
    since = "0.1.0",
    note = "Atomic liquidity addition is implemented in deposit_liquidity."
)]
pub struct MintLiquidity<'info> {
    /// The user performing the liquidity mint.
    #[account(mut)]
    pub user: Signer<'info>,
}
