use anchor_lang::prelude::*;
use anchor_lang::prelude::InterfaceAccount;
use anchor_spl::token_interface::Mint;

use crate::state::Pool;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_a_mint: InterfaceAccount<'info, Mint>,

    pub token_b_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = Pool::LEN,
        seeds = [
            b"pool",
            token_a_mint.key().as_ref(),
            token_b_mint.key().as_ref()
        ],
        bump
    )]
    pub pool: Account<'info, Pool>,

    pub system_program: Program<'info, System>,
}