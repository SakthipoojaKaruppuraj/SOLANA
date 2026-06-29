use anchor_lang::prelude::*;

/// Returns the seeds for the vault authority PDA of a given pool.
///
/// # Arguments
/// * `pool_key` - The public key of the pool.
/// * `bump` - The bump seed for the vault authority PDA.
pub fn get_vault_authority_seeds<'a>(pool_key: &'a Pubkey, bump: &'a u8) -> [&'a [u8]; 3] {
    [
        b"vault-authority",
        pool_key.as_ref(),
        std::slice::from_ref(bump),
    ]
}
