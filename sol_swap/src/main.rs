mod utils;

use solana_client::rpc_client::RpcClient;
use solana_sdk::signature::Signer;

use utils::wallet::{
    load_wallet,
    check_balance,
};

use utils::token::{
    create_or_load_ini_mint,
    create_or_load_adhee_mint,
    create_mint_on_chain,
    create_ata,
    get_token_balance,
};

use utils::pool::{
    create_or_load_pool_authority,
    create_pool_vault,
    get_pool_reserve,
    add_liquidity,
};

use utils::swap::{
    calculate_swap_output,
    execute_swap,
};

fn main() {
    let wallet = load_wallet();

    check_balance(
        &wallet.pubkey().to_string(),
    );

    let rpc = RpcClient::new(
        "https://api.devnet.solana.com".to_string(),
    );

    let ini_mint =
        create_or_load_ini_mint();

    let adhee_mint =
        create_or_load_adhee_mint();

    let pool_authority =
        create_or_load_pool_authority();

    create_mint_on_chain(
        &rpc,
        &wallet,
        &ini_mint,
        "INI",
    );

    create_mint_on_chain(
        &rpc,
        &wallet,
        &adhee_mint,
        "ADHEE",
    );

    create_ata(
        &rpc,
        &wallet,
        &ini_mint,
        "INI",
    );

    create_ata(
        &rpc,
        &wallet,
        &adhee_mint,
        "ADHEE",
    );

    create_pool_vault(
        &rpc,
        &wallet,
        &pool_authority,
        &ini_mint,
        "INI",
    );

    create_pool_vault(
        &rpc,
        &wallet,
        &pool_authority,
        &adhee_mint,
        "ADHEE",
    );

    /*add_liquidity(
        &rpc,
        &wallet,
        &pool_authority,
        &ini_mint,
        &adhee_mint,
        50_000_000_000,
        50_000_000_000,
    );*/

    get_token_balance(
        &rpc,
        &wallet,
        &ini_mint,
        "INI",
    );

    get_token_balance(
        &rpc,
        &wallet,
        &adhee_mint,
        "ADHEE",
    );

    get_pool_reserve(
        &rpc,
        &pool_authority,
        &ini_mint,
        "INI",
    );

    get_pool_reserve(
        &rpc,
        &pool_authority,
        &adhee_mint,
        "ADHEE",
    );

    let amount_out =
    calculate_swap_output(
        50,
        50,
        10,
    );
    
    
    println!("Swap 10 INI -> {} ADHEE",amount_out);

    /*execute_swap(
        &rpc,
        &wallet,
        &pool_authority,
        &ini_mint,
        &adhee_mint,
        10,
    );*/
}