use solana_client::rpc_client::RpcClient;
use solana_sdk::signature::Signer;

mod config;
mod nft;

fn main() {
    let wallet = nft::utils::get_or_create_wallet();

    let client =
        RpcClient::new(config::RPC_URL.to_string());

    println!("\nWallet Address:");
    println!("{}", wallet.pubkey());

    let balance = client
        .get_balance(&wallet.pubkey())
        .unwrap();

    println!(
        "\nBalance: {:.9} SOL",
        balance as f64 / 1_000_000_000.0
    );

    let mint_address =
        nft::mint::get_or_create_mint(
            &client,
            &wallet,
        );

    println!("\nUsing Mint:");
    println!("{}", mint_address);

    let ata_address =
    nft::ata::create_ata(
        &client,
        &wallet,
        &mint_address,
    );
    println!("\nUsing ATA:");
    println!("{}", ata_address);

    nft::token::mint_nft(
        &client,
        &wallet,
        &mint_address,
        &ata_address,
    );

    match client.get_balance(&wallet.pubkey()) {
    Ok(balance) => {
        println!(
            "\nBalance: {:.9} SOL",
            balance as f64 / 1_000_000_000.0
        );
    }
    Err(err) => {
        println!("\nBalance Fetch Failed");
        println!("{:?}", err);
        return;
    }
}

nft::metadata::test_metadata_module();

}