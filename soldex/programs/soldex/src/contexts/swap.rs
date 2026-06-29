use anchor_lang::prelude::InterfaceAccount;
use anchor_lang::prelude::*;

use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::error::SoldexError;
use crate::state::Pool;

#[derive(Accounts)]
pub struct Swap<'info> {
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
        constraint = mint_in.key() != mint_out.key() @ SoldexError::InvalidTokenMint,
        constraint = (mint_in.key() == pool.token_a_mint || mint_in.key() == pool.token_b_mint) @ SoldexError::InvalidTokenMint
    )]
    pub mint_in: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        constraint = (mint_out.key() == pool.token_a_mint || mint_out.key() == pool.token_b_mint) @ SoldexError::InvalidTokenMint
    )]
    pub mint_out: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        constraint = vault_in.key() == pool.vault_a || vault_in.key() == pool.vault_b @ SoldexError::InvalidVault,
        constraint = (
            (vault_in.key() == pool.vault_a && mint_in.key() == pool.token_a_mint)
            ||
            (vault_in.key() == pool.vault_b && mint_in.key() == pool.token_b_mint)
        ) @ SoldexError::InvalidVault
    )]
    pub vault_in: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = vault_out.key() == pool.vault_a || vault_out.key() == pool.vault_b @ SoldexError::InvalidVault,
        constraint = (
            (vault_out.key() == pool.vault_a && mint_out.key() == pool.token_a_mint)
            ||
            (vault_out.key() == pool.vault_b && mint_out.key() == pool.token_b_mint)
        ) @ SoldexError::InvalidVault,
        constraint = vault_in.key() != vault_out.key() @ SoldexError::InvalidVault
    )]
    pub vault_out: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user_token_in.owner == user.key(),
        constraint = user_token_in.mint == mint_in.key() @ SoldexError::InvalidTokenMint
    )]
    pub user_token_in: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user_token_out.owner == user.key(),
        constraint = user_token_out.mint == mint_out.key() @ SoldexError::InvalidTokenMint
    )]
    pub user_token_out: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
}
