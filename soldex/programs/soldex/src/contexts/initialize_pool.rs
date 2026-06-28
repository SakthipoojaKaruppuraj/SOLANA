use anchor_lang::prelude::*;
use anchor_lang::prelude::InterfaceAccount;

use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    Mint,
    TokenAccount,
    TokenInterface,
};

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

    /// CHECK:
    /// PDA that will own both token vaults.
    #[account(
        seeds = [
            b"vault-authority",
            pool.key().as_ref()
        ],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = token_a_mint,
        associated_token::authority = vault_authority,
        associated_token::token_program = token_program,
    )]
    pub vault_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = token_b_mint,
        associated_token::authority = vault_authority,
        associated_token::token_program = token_program,
    )]
    pub vault_b: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}