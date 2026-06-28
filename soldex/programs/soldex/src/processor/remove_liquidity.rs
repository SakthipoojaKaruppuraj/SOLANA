use anchor_lang::prelude::*;

use crate::contexts::RemoveLiquidity;

pub fn remove_liquidity(
    _ctx: Context<RemoveLiquidity>,
    _lp_amount: u64,
) -> Result<()> {
    Ok(())
}