use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

use spl_token::{
    instruction::mint_to,
    state::Mint,
};

use spl_token::solana_program::program_pack::Pack;

pub fn mint_nft(
    client: &RpcClient,
    wallet: &Keypair,
    mint: &Pubkey,
    ata: &Pubkey,
) {
    let mint_account = match client.get_account(mint) {
        Ok(account) => account,
        Err(err) => {
            println!("Failed to fetch mint account");
            println!("{:?}", err);
            return;
        }
    };

    let mint_state = match Mint::unpack(&mint_account.data) {
        Ok(mint) => mint,
        Err(err) => {
            println!("Failed to unpack mint");
            println!("{:?}", err);
            return;
        }
    };

    println!(
        "\nCurrent Supply: {}",
        mint_state.supply
    );

    if mint_state.supply > 0 {
        println!(
            "\nNFT already minted. Skipping."
        );
        return;
    }

    println!("\nMinting NFT...");

    let recent_blockhash =
        match client.get_latest_blockhash() {
            Ok(blockhash) => blockhash,
            Err(err) => {
                println!("{:?}", err);
                return;
            }
        };

    let mint_ix = match mint_to(
        &spl_token::id(),
        mint,
        ata,
        &wallet.pubkey(),
        &[],
        1,
    ) {
        Ok(ix) => ix,
        Err(err) => {
            println!("{:?}", err);
            return;
        }
    };

    let tx = Transaction::new_signed_with_payer(
        &[mint_ix],
        Some(&wallet.pubkey()),
        &[wallet],
        recent_blockhash,
    );

    match client.send_and_confirm_transaction(&tx) {
        Ok(signature) => {
            println!("\nNFT Minted Successfully");

            println!("\nTransaction:");
            println!("{}", signature);
        }

        Err(err) => {
            println!("\nMint Failed");
            println!("{:?}", err);
        }
    }
}