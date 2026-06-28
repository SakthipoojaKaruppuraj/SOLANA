use anchor_lang::prelude::*;
use anchor_lang::prelude::InterfaceAccount;

use anchor_spl::token_interface::{
    Mint,
    TokenAccount,
    TokenInterface,
};

use crate::state::Pool;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub token_a_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub token_b_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub vault_a: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub vault_b: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_a: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_b: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub lp_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub user_lp_token: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
}