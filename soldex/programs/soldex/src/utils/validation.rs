use crate::error::SoldexError;
use anchor_lang::prelude::*;

/// Validates that a vault account key matches the expected pool vault key.
///
/// # Arguments
/// * `vault_key` - Key of the vault account.
/// * `expected_vault_key` - Expected vault key stored in the pool.
pub fn validate_vault(vault_key: Pubkey, expected_vault_key: Pubkey) -> Result<()> {
    if vault_key != expected_vault_key {
        return Err(error!(SoldexError::InvalidVault));
    }
    Ok(())
}

/// Validates that a token mint matches the expected pool token mint.
///
/// # Arguments
/// * `mint_key` - Key of the mint account.
/// * `expected_mint_key` - Expected mint key stored in the pool.
pub fn validate_mint(mint_key: Pubkey, expected_mint_key: Pubkey) -> Result<()> {
    if mint_key != expected_mint_key {
        return Err(error!(SoldexError::InvalidTokenMint));
    }
    Ok(())
}
