use solana_sdk::signature::{Keypair, Signer};
use std::fs;
use std::path::Path;

pub fn get_or_create_wallet() -> Keypair {
    if Path::new("wallet.json").exists() {
        return load_wallet();
    }

    let wallet = Keypair::new();

    let bytes = wallet.to_bytes();

    fs::write(
        "wallet.json",
        serde_json::to_string(&bytes.to_vec()).unwrap(),
    )
    .unwrap();

    println!("New Wallet Created");
    println!("Public Key: {}", wallet.pubkey());

    wallet
}

pub fn load_wallet() -> Keypair {
    let data = fs::read_to_string("wallet.json")
        .expect("wallet.json not found");

    let bytes: Vec<u8> =
        serde_json::from_str(&data).unwrap();

    let wallet =
        Keypair::try_from(bytes.as_slice()).unwrap();

    println!("Existing Wallet Loaded");
    println!("Public Key: {}", wallet.pubkey());

    wallet
}