mod mint;
mod metadata;
mod wallet;
mod constants;

fn main() {
    wallet::load_wallet::load_wallet();

    mint::create_nft::create_nft();

    metadata::create_metadata::create_metadata();

    println!(
        "Network: {}",
        constants::config::NETWORK
    );
}