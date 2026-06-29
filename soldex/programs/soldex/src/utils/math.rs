use anchor_lang::prelude::*;

pub fn integer_sqrt(value: u128) -> u64 {
    (value as f64).sqrt() as u64
}

pub fn initial_lp(amount_a: u64, amount_b: u64) -> u64 {
    integer_sqrt(amount_a as u128 * amount_b as u128)
}

pub fn proportional_lp(
    amount_a: u64,
    amount_b: u64,
    reserve_a: u64,
    reserve_b: u64,
    total_lp: u64,
) -> Result<u64> {
    let lp_a = (amount_a as u128)
        .checked_mul(total_lp as u128)
        .unwrap()
        / reserve_a as u128;

    let lp_b = (amount_b as u128)
        .checked_mul(total_lp as u128)
        .unwrap()
        / reserve_b as u128;

    Ok(lp_a.min(lp_b) as u64)
}