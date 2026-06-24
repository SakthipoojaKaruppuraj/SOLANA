use std::path::Path;

use solana_client::rpc_client::RpcClient;

use solana_sdk::{
    program_pack::Pack,
    signature::{
        read_keypair_file,
        write_keypair_file,
        Keypair,
        Signer,
    },
};

use spl_associated_token_account::{
    get_associated_token_address,
    instruction::create_associated_token_account,
};

use spl_token::state::Account;

use solana_sdk::transaction::Transaction;

use spl_token::instruction::transfer_checked;

use spl_token::state::Mint;

pub fn create_or_load_pool_authority() -> Keypair {
    let path = "wallets/pool_authority.json";

    if Path::new(path).exists() {
        let kp =
            read_keypair_file(path)
                .expect("Failed to load pool authority");

        println!(
            "Pool Authority Loaded: {}",
            kp.pubkey()
        );

        return kp;
    }

    let kp = Keypair::new();

    write_keypair_file(&kp, path)
        .expect("Failed to save pool authority");

    println!(
        "Pool Authority Created: {}",
        kp.pubkey()
    );

    kp
}

pub fn create_pool_vault(
    rpc: &RpcClient,
    payer: &Keypair,
    authority: &Keypair,
    mint: &Keypair,
    token_name: &str,
) {
    let vault =
        get_associated_token_address(
            &authority.pubkey(),
            &mint.pubkey(),
        );

    if rpc.get_account(&vault).is_ok() {
        println!(
            "{} Vault Already Exists: {}",
            token_name,
            vault
        );
        return;
    }

    let blockhash =
        rpc.get_latest_blockhash().unwrap();

    let ix =
        create_associated_token_account(
            &payer.pubkey(),
            &authority.pubkey(),
            &mint.pubkey(),
            &spl_token::id(),
        );

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[payer],
        blockhash,
    );

    rpc.send_and_confirm_transaction(&tx)
        .unwrap();

    println!(
        "{} Vault Created: {}",
        token_name,
        vault
    );
}

pub fn get_pool_reserve(
    rpc: &RpcClient,
    authority: &Keypair,
    mint: &Keypair,
    token_name: &str,
) {
    let vault =
        get_associated_token_address(
            &authority.pubkey(),
            &mint.pubkey(),
        );

    let account =
        rpc.get_account(&vault)
            .unwrap();

    let token_account =
        Account::unpack(&account.data)
            .unwrap();

    println!(
        "{} Pool Reserve: {}",
        token_name,
        token_account.amount as f64
            / 1_000_000_000.0
    );
}

pub fn add_liquidity(
    rpc: &RpcClient,
    user: &Keypair,
    authority: &Keypair,
    ini_mint: &Keypair,
    adhee_mint: &Keypair,
    ini_amount: u64,
    adhee_amount: u64,
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

    let vault_ini =
        get_associated_token_address(
            &authority.pubkey(),
            &ini_mint.pubkey(),
        );

    let vault_adhee =
        get_associated_token_address(
            &authority.pubkey(),
            &adhee_mint.pubkey(),
        );

    let blockhash =
        rpc.get_latest_blockhash().unwrap();

    let transfer_ini =
        transfer_checked(
            &spl_token::id(),
            &user_ini,
            &ini_mint.pubkey(),
            &vault_ini,
            &user.pubkey(),
            &[],
            ini_amount,
            9,
        )
        .unwrap();

    let transfer_adhee =
        transfer_checked(
            &spl_token::id(),
            &user_adhee,
            &adhee_mint.pubkey(),
            &vault_adhee,
            &user.pubkey(),
            &[],
            adhee_amount,
            9,
        )
        .unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[
            transfer_ini,
            transfer_adhee,
        ],
        Some(&user.pubkey()),
        &[user],
        blockhash,
    );

    let sig = rpc
        .send_and_confirm_transaction(&tx)
        .unwrap();

    println!(
        "Liquidity Added"
    );

    println!(
        "Tx: {}",
        sig
    );
}