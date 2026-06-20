use solana_sdk::signature::{Keypair, Signer};

fn main() {
    let wallet = Keypair::new();

    println!("Wallet Created");
    println!("Public Key: {}", wallet.pubkey());

    let private_key = wallet.to_bytes();

    println!("Private Key:");
    println!("{:?}", private_key);
}