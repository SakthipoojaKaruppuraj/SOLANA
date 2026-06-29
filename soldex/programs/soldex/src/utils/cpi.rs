use anchor_lang::prelude::*;
use anchor_spl::token_interface::{burn, mint_to, transfer_checked, Burn, MintTo, TransferChecked};

/// Performs a `transfer_checked` CPI to transfer tokens.
///
/// # Arguments
/// * `token_program` - The SPL Token program account info.
/// * `from` - The source token account.
/// * `mint` - The token mint.
/// * `to` - The destination token account.
/// * `authority` - The authority keypair/PDA.
/// * `amount` - The number of tokens to transfer.
/// * `decimals` - The decimal precision of the token mint.
/// * `signer_seeds` - Optional seeds if the transfer is authorized by a PDA.
#[allow(clippy::too_many_arguments)]
pub fn cpi_transfer_checked<'info>(
    token_program: AccountInfo<'info>,
    from: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    amount: u64,
    decimals: u8,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from,
        mint,
        to,
        authority,
    };
    let cpi_ctx = if signer_seeds.is_empty() {
        CpiContext::new(token_program.key(), cpi_accounts)
    } else {
        CpiContext::new_with_signer(token_program.key(), cpi_accounts, signer_seeds)
    };
    transfer_checked(cpi_ctx, amount, decimals)
}

/// Performs a `mint_to` CPI to issue new LP tokens.
///
/// # Arguments
/// * `token_program` - The SPL Token program account info.
/// * `mint` - The LP mint account.
/// * `to` - The user's destination LP token account.
/// * `authority` - The vault authority PDA.
/// * `amount` - The number of LP tokens to mint.
/// * `signer_seeds` - Seeds for the vault authority PDA signer.
pub fn cpi_mint_to<'info>(
    token_program: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = MintTo {
        mint,
        to,
        authority,
    };
    let cpi_ctx = CpiContext::new_with_signer(token_program.key(), cpi_accounts, signer_seeds);
    mint_to(cpi_ctx, amount)
}

/// Performs a `burn` CPI to burn LP tokens.
///
/// # Arguments
/// * `token_program` - The SPL Token program account info.
/// * `mint` - The LP mint account.
/// * `from` - The user's source LP token account.
/// * `authority` - The user signer.
/// * `amount` - The number of LP tokens to burn.
pub fn cpi_burn<'info>(
    token_program: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    from: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Burn {
        mint,
        from,
        authority,
    };
    let cpi_ctx = CpiContext::new(token_program.key(), cpi_accounts);
    burn(cpi_ctx, amount)
}
