use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    native_token::LAMPORTS_PER_SOL,
    signature::{
        read_keypair_file,
        Keypair,
        Signer,
    },
};

pub fn load_wallet() -> Keypair {
    let wallet =
        read_keypair_file("wallets/wallet.json")
            .expect("Failed to load wallet");

    println!("Wallet Loaded");
    println!("Address: {}", wallet.pubkey());

    wallet
}

pub fn check_balance(wallet_address: &str) {
    let rpc = RpcClient::new(
        "https://api.devnet.solana.com".to_string(),
    );

    let pubkey = wallet_address
        .parse()
        .expect("Invalid wallet address");

    let balance = rpc
        .get_balance(&pubkey)
        .expect("Failed to get balance");

    println!(
        "Balance: {} SOL",
        balance as f64 / LAMPORTS_PER_SOL as f64
    );
}