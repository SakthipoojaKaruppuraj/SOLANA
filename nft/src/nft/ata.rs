use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

use spl_associated_token_account::{
    get_associated_token_address,
    instruction::create_associated_token_account,
};

pub fn create_ata(
    client: &RpcClient,
    wallet: &Keypair,
    mint: &Pubkey,
) -> Pubkey {
    let ata_address =
        get_associated_token_address(
            &wallet.pubkey(),
            mint,
        );

    if client
        .get_account(&ata_address)
        .is_ok()
    {
        println!("\nExisting ATA Found");
        println!("{}", ata_address);

        return ata_address;
    }

    println!("\nCreating ATA...");

    let recent_blockhash =
        client.get_latest_blockhash().unwrap();

    let create_ata_ix =
        create_associated_token_account(
            &wallet.pubkey(),
            &wallet.pubkey(),
            mint,
            &spl_token::id(),
        );

    let tx = Transaction::new_signed_with_payer(
        &[create_ata_ix],
        Some(&wallet.pubkey()),
        &[wallet],
        recent_blockhash,
    );

    let signature = client
        .send_and_confirm_transaction(&tx)
        .unwrap();

    println!("\nATA Created");
    println!("{}", ata_address);

    println!("\nTransaction:");
    println!("{}", signature);

    ata_address
}