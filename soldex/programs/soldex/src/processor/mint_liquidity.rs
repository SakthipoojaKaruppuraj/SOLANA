#![allow(deprecated)]

use anchor_lang::prelude::*;

use crate::contexts::mint_liquidity::MintLiquidity;

/// Handler for the deprecated `mint_liquidity` instruction.
///
/// This function is kept for reference only and is no longer exposed by the program.
#[deprecated(
    since = "0.1.0",
    note = "Atomic liquidity addition is implemented in deposit_liquidity."
)]
pub fn mint_liquidity(_ctx: Context<MintLiquidity>) -> Result<()> {
    msg!("Mint Liquidity");

    Ok(())
}
