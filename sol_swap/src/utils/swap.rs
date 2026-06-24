use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    program_pack::Pack,
    signature::{
        Keypair,
        Signer,
    },
    transaction::Transaction,
};

use spl_associated_token_account::get_associated_token_address;

use spl_token::{
    instruction::transfer_checked,
    state::Account,
};

pub fn calculate_swap_output(
    reserve_in: u64,
    reserve_out: u64,
    amount_in: u64,
) -> u64 {
    let reserve_in = reserve_in as f64;
    let reserve_out = reserve_out as f64;
    let amount_in = amount_in as f64;

    let k = reserve_in * reserve_out;

    let new_reserve_in = reserve_in + amount_in;

    let new_reserve_out = k / new_reserve_in;

    let amount_out =
        reserve_out - new_reserve_out;

    amount_out as u64
}

pub fn execute_swap(
    rpc: &RpcClient,
    user: &Keypair,
    pool_authority: &Keypair,
    ini_mint: &Keypair,
    adhee_mint: &Keypair,
    amount_in: u64,
) {
    let user_ini =
        get_associated_token_address(
            &user.pubkey(),
            &ini_mint.pubkey(),
        );

    let user_adhee =
        get_associated_token_address(
            &user.pubkey(),
            &adhee_mint.pubkey(),
        );

    let pool_ini =
        get_associated_token_address(
            &pool_authority.pubkey(),
            &ini_mint.pubkey(),
        );

    let pool_adhee =
        get_associated_token_address(
            &pool_authority.pubkey(),
            &adhee_mint.pubkey(),
        );

    let ini_account = rpc
        .get_account(&pool_ini)
        .unwrap();

    let adhee_account = rpc
        .get_account(&pool_adhee)
        .unwrap();

    let ini_data =
        Account::unpack(&ini_account.data)
            .unwrap();

    let adhee_data =
        Account::unpack(&adhee_account.data)
            .unwrap();

    let reserve_in =
        ini_data.amount / 1_000_000_000;

    let reserve_out =
        adhee_data.amount / 1_000_000_000;

    let amount_out =
        calculate_swap_output(
            reserve_in,
            reserve_out,
            amount_in,
        );

    println!(
        "Swap Output: {} ADHEE",
        amount_out
    );

    let blockhash =
        rpc.get_latest_blockhash().unwrap();

    let transfer_in =
        transfer_checked(
            &spl_token::id(),
            &user_ini,
            &ini_mint.pubkey(),
            &pool_ini,
            &user.pubkey(),
            &[],
            amount_in * 1_000_000_000,
            9,
        )
        .unwrap();

    let transfer_out =
        transfer_checked(
            &spl_token::id(),
            &pool_adhee,
            &adhee_mint.pubkey(),
            &user_adhee,
            &pool_authority.pubkey(),
            &[],
            amount_out * 1_000_000_000,
            9,
        )
        .unwrap();

    let tx =
        Transaction::new_signed_with_payer(
            &[
                transfer_in,
                transfer_out,
            ],
            Some(&user.pubkey()),
            &[
                user,
                pool_authority,
            ],
            blockhash,
        );

    let sig = rpc
        .send_and_confirm_transaction(&tx)
        .unwrap();

    println!(
        "Swap Executed"
    );

    println!(
        "Tx: {}",
        sig
    );
}