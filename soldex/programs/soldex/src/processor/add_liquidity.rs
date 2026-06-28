use anchor_lang::prelude::*;

use crate::contexts::AddLiquidity;

pub fn add_liquidity(
    _ctx: Context<AddLiquidity>,
    amount_a: u64,
    amount_b: u64,
) -> Result<()> {

    msg!("==============================");
    msg!("ADD LIQUIDITY");
    msg!("Token A : {}", amount_a);
    msg!("Token B : {}", amount_b);
    msg!("==============================");

    Ok(())
}