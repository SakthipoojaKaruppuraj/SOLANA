use serde::{Deserialize, Serialize};

use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_instruction,
    transaction::Transaction,
};

use spl_token::{
    instruction::initialize_mint,
    state::Mint,
};

use spl_token::solana_program::program_pack::Pack;

use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize)]
struct MintData {
    mint_address: String,
}

pub fn get_or_create_mint(
    client: &RpcClient,
    wallet: &Keypair,
) -> Pubkey {
    if Path::new("mint.json").exists() {
        return load_mint();
    }

    create_nft_mint(client, wallet)
}

fn create_nft_mint(
    client: &RpcClient,
    wallet: &Keypair,
) -> Pubkey {
    println!("\nCreating NFT Mint...");

    let mint_keypair = Keypair::new();

    let rent = client
        .get_minimum_balance_for_rent_exemption(
            Mint::LEN,
        )
        .unwrap();

    let recent_blockhash =
        client.get_latest_blockhash().unwrap();

    let create_mint_account_ix =
        system_instruction::create_account(
            &wallet.pubkey(),
            &mint_keypair.pubkey(),
            rent,
            Mint::LEN as u64,
            &spl_token::id(),
        );

    let initialize_mint_ix =
        initialize_mint(
            &spl_token::id(),
            &mint_keypair.pubkey(),
            &wallet.pubkey(),
            Some(&wallet.pubkey()),
            0,
        )
        .unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[
            create_mint_account_ix,
            initialize_mint_ix,
        ],
        Some(&wallet.pubkey()),
        &[wallet, &mint_keypair],
        recent_blockhash,
    );

    let signature = client
        .send_and_confirm_transaction(&tx)
        .unwrap();

    let mint_address = mint_keypair.pubkey();

    let mint_data = MintData {
        mint_address: mint_address.to_string(),
    };

    fs::write(
        "mint.json",
        serde_json::to_string_pretty(
            &mint_data,
        )
        .unwrap(),
    )
    .unwrap();

    println!("\nMint Created Successfully");
    println!("Mint Address:");
    println!("{}", mint_address);

    println!("\nTransaction:");
    println!("{}", signature);

    mint_address
}

fn load_mint() -> Pubkey {
    let data =
        fs::read_to_string("mint.json")
            .expect("mint.json not found");

    let mint_data: MintData =
        serde_json::from_str(&data)
            .unwrap();

    let mint_pubkey =
        mint_data
            .mint_address
            .parse::<Pubkey>()
            .unwrap();

    println!("\nExisting Mint Loaded");
    println!("{}", mint_pubkey);

    mint_pubkey
}