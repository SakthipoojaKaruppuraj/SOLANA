use mpl_token_metadata::{
    instructions::{
        CreateMasterEditionV3Builder,
        CreateMetadataAccountV3Builder,
    },
    types::DataV2,
    ID as TOKEN_METADATA_PROGRAM_ID,
};

use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

pub fn create_metadata(
    client: &RpcClient,
    wallet: &Keypair,
    mint: &Pubkey,
) {
    println!("\nCreating Metadata...");

    let (metadata_pda, _) = Pubkey::find_program_address(
        &[
            b"metadata",
            TOKEN_METADATA_PROGRAM_ID.as_ref(),
            mint.as_ref(),
        ],
        &TOKEN_METADATA_PROGRAM_ID,
    );

    println!("Metadata PDA:");
    println!("{}", metadata_pda);

    let data = DataV2 {
        name: "scoobynft".to_string(),
        symbol: "scoo".to_string(),
        uri: "https://gateway.pinata.cloud/ipfs/bafkreihvjwiut5mj3o2xtgb6hexsrudnjxwkowys2aocbubi6bdsy5vjge"
    .to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let ix = CreateMetadataAccountV3Builder::new()
        .metadata(metadata_pda)
        .mint(*mint)
        .mint_authority(wallet.pubkey())
        .payer(wallet.pubkey())
        .update_authority(wallet.pubkey(), true)
        .data(data)
        .is_mutable(true)
        .instruction();

    let blockhash =
        client.get_latest_blockhash().unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&wallet.pubkey()),
        &[wallet],
        blockhash,
    );

    match client.send_and_confirm_transaction(&tx) {
        Ok(sig) => {
            println!("\nMetadata Created Successfully");
            println!("Transaction:");
            println!("{}", sig);
        }
        Err(err) => {
            println!("\nMetadata Creation Failed");
            println!("{:?}", err);
        }
    }
}

pub fn create_master_edition(
    client: &RpcClient,
    wallet: &Keypair,
    mint: &Pubkey,
) {
    println!("\nCreating Master Edition...");

    let (metadata_pda, _) = Pubkey::find_program_address(
        &[
            b"metadata",
            TOKEN_METADATA_PROGRAM_ID.as_ref(),
            mint.as_ref(),
        ],
        &TOKEN_METADATA_PROGRAM_ID,
    );

    let (edition_pda, _) = Pubkey::find_program_address(
        &[
            b"metadata",
            TOKEN_METADATA_PROGRAM_ID.as_ref(),
            mint.as_ref(),
            b"edition",
        ],
        &TOKEN_METADATA_PROGRAM_ID,
    );

    println!("Edition PDA:");
    println!("{}", edition_pda);

    let ix = CreateMasterEditionV3Builder::new()
        .edition(edition_pda)
        .mint(*mint)
        .update_authority(wallet.pubkey())
        .mint_authority(wallet.pubkey())
        .payer(wallet.pubkey())
        .metadata(metadata_pda)
        .max_supply(0)
        .instruction();

    let blockhash =
        client.get_latest_blockhash().unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&wallet.pubkey()),
        &[wallet],
        blockhash,
    );

    match client.send_and_confirm_transaction(&tx) {
        Ok(sig) => {
            println!("\nMaster Edition Created");
            println!("Transaction:");
            println!("{}", sig);
        }
        Err(err) => {
            println!("\nMaster Edition Failed");
            println!("{:?}", err);
        }
    }
}