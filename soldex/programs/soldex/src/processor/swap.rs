use anchor_lang::prelude::*;

use crate::contexts::Swap;

pub fn swap(
    _ctx: Context<Swap>,
    _amount_in: u64,
    _minimum_amount_out: u64,
) -> Result<()> {
    Ok(())
}