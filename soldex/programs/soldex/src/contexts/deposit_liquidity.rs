use anchor_lang::prelude::InterfaceAccount;
use anchor_lang::prelude::*;

use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::error::SoldexError;
use crate::state::Pool;

#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = pool.is_initialized,
    )]
    pub pool: Box<Account<'info, Pool>>,

    /// CHECK:
    #[account(
        seeds = [
            b"vault-authority",
            pool.key().as_ref()
        ],
        bump,
        constraint = vault_authority.key() == pool.vault_authority @ SoldexError::InvalidVaultAuthority
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        constraint = token_a_mint.key() == pool.token_a_mint @ SoldexError::InvalidTokenMint
    )]
    pub token_a_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        constraint = token_b_mint.key() == pool.token_b_mint @ SoldexError::InvalidTokenMint
    )]
    pub token_b_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        constraint = vault_a.key() == pool.vault_a @ SoldexError::InvalidVault
    )]
    pub vault_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = vault_b.key() == pool.vault_b @ SoldexError::InvalidVault
    )]
    pub vault_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user_token_a.owner == user.key(),
        constraint = user_token_a.mint == token_a_mint.key() @ SoldexError::InvalidTokenMint
    )]
    pub user_token_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user_token_b.owner == user.key(),
        constraint = user_token_b.mint == token_b_mint.key() @ SoldexError::InvalidTokenMint
    )]
    pub user_token_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = lp_mint.key() == pool.lp_mint @ SoldexError::InvalidLpMint
    )]
    pub lp_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        constraint = user_lp_token.owner == user.key(),
        constraint = user_lp_token.mint == lp_mint.key() @ SoldexError::InvalidLpMint
    )]
    pub user_lp_token: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
}
