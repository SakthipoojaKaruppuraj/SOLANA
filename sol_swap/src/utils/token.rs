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
    system_instruction,
    transaction::Transaction,
};

use spl_associated_token_account::{
    get_associated_token_address,
    instruction::create_associated_token_account,
};

use spl_token::{
    instruction::{
        initialize_mint,
        mint_to,
    },
    state::{
        Account,
        Mint,
    },
};

pub fn create_or_load_mint(
    path: &str,
    token_name: &str,
) -> Keypair {
    if Path::new(path).exists() {
        let mint = read_keypair_file(path)
            .expect("Failed to load mint");

        println!(
            "{} Mint Loaded: {}",
            token_name,
            mint.pubkey()
        );

        return mint;
    }

    let mint = Keypair::new();

    write_keypair_file(&mint, path)
        .expect("Failed to save mint");

    println!(
        "{} Mint Created: {}",
        token_name,
        mint.pubkey()
    );

    mint
}

pub fn create_or_load_ini_mint() -> Keypair {
    create_or_load_mint(
        "mints/ini_mint.json",
        "INI",
    )
}

pub fn create_or_load_adhee_mint() -> Keypair {
    create_or_load_mint(
        "mints/adhee_mint.json",
        "ADHEE",
    )
}

pub fn create_mint_on_chain(
    rpc: &RpcClient,
    payer: &Keypair,
    mint: &Keypair,
    token_name: &str,
) {
    if rpc.get_account(&mint.pubkey()).is_ok() {
        println!(
            "{} Mint Already Exists On Chain",
            token_name
        );
        return;
    }

    let rent = rpc
        .get_minimum_balance_for_rent_exemption(
            Mint::LEN,
        )
        .unwrap();

    let blockhash =
        rpc.get_latest_blockhash().unwrap();

    let create_account_ix =
        system_instruction::create_account(
            &payer.pubkey(),
            &mint.pubkey(),
            rent,
            Mint::LEN as u64,
            &spl_token::id(),
        );

    let initialize_mint_ix =
        initialize_mint(
            &spl_token::id(),
            &mint.pubkey(),
            &payer.pubkey(),
            None,
            9,
        )
        .unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[
            create_account_ix,
            initialize_mint_ix,
        ],
        Some(&payer.pubkey()),
        &[payer, mint],
        blockhash,
    );

    let sig = rpc
        .send_and_confirm_transaction(&tx)
        .unwrap();

    println!(
        "{} Mint Created On Chain",
        token_name
    );

    println!("Tx: {}", sig);
}

pub fn create_ata(
    rpc: &RpcClient,
    payer: &Keypair,
    mint: &Keypair,
    token_name: &str,
) {
    let ata = get_associated_token_address(
        &payer.pubkey(),
        &mint.pubkey(),
    );

    if rpc.get_account(&ata).is_ok() {
        println!(
            "{} ATA Already Exists: {}",
            token_name,
            ata
        );
        return;
    }

    let blockhash =
        rpc.get_latest_blockhash().unwrap();

    let ix =
        create_associated_token_account(
            &payer.pubkey(),
            &payer.pubkey(),
            &mint.pubkey(),
            &spl_token::id(),
        );

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[payer],
        blockhash,
    );

    let sig = rpc
        .send_and_confirm_transaction(&tx)
        .unwrap();

    println!(
        "{} ATA Created: {}",
        token_name,
        ata
    );

    println!("Tx: {}", sig);
}

pub fn mint_tokens(
    rpc: &RpcClient,
    payer: &Keypair,
    mint: &Keypair,
    token_name: &str,
    amount: u64,
) {
    let ata = get_associated_token_address(
        &payer.pubkey(),
        &mint.pubkey(),
    );

    let blockhash =
        rpc.get_latest_blockhash().unwrap();

    let ix = mint_to(
        &spl_token::id(),
        &mint.pubkey(),
        &ata,
        &payer.pubkey(),
        &[],
        amount,
    )
    .unwrap();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[payer],
        blockhash,
    );

    let sig = rpc
        .send_and_confirm_transaction(&tx)
        .unwrap();

    println!(
        "Minted {} {}",
        amount,
        token_name
    );

    println!("Tx: {}", sig);
}

pub fn get_token_balance(
    rpc: &RpcClient,
    wallet: &Keypair,
    mint: &Keypair,
    token_name: &str,
) {
    let ata = get_associated_token_address(
        &wallet.pubkey(),
        &mint.pubkey(),
    );

    let account = rpc
        .get_account(&ata)
        .expect("Failed to fetch ATA");

    let token_account =
        Account::unpack(&account.data)
            .expect("Failed to unpack token account");

    println!(
        "{} Balance: {}",
        token_name,
        token_account.amount as f64 / 1_000_000_000.0
    );
}