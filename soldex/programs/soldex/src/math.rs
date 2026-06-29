use crate::error::SoldexError;
use anchor_lang::prelude::*;

/// Computes the pure integer square root of a `u128` value using the binary search method.
///
/// This avoids using floating point arithmetic on-chain, ensuring deterministic behavior and stability.
///
/// # Arguments
/// * `value` - The number to compute the square root of.
///
/// # Returns
/// * `Result<u64>` - The computed square root, or a `MathOverflow` error on overflow.
pub fn pure_integer_sqrt(value: u128) -> Result<u64> {
    if value == 0 {
        return Ok(0);
    }
    let mut res = 0u128;
    let mut one = 1u128 << 126;
    let mut op = value;

    while one > op {
        one >>= 2;
    }

    while one != 0 {
        if op >= res + one {
            op = op
                .checked_sub(res + one)
                .ok_or(error!(SoldexError::MathOverflow))?;
            res = (res >> 1) + one;
        } else {
            res >>= 1;
        }
        one >>= 2;
    }

    Ok(res as u64)
}

/// Calculates the LP token shares to mint during liquidity deposit.
///
/// If the pool's total LP supply is 0, uses:
/// `lp_amount = sqrt(amount_a * amount_b)`
/// Otherwise, uses the proportional contribution:
/// `lp_amount = min(amount_a * total_lp / reserve_a, amount_b * total_lp / reserve_b)`
///
/// # Arguments
/// * `amount_a` - The amount of Token A deposited.
/// * `amount_b` - The amount of Token B deposited.
/// * `reserve_a` - The current pool reserve of Token A.
/// * `reserve_b` - The current pool reserve of Token B.
/// * `total_lp_supply` - The current total outstanding supply of LP tokens.
///
/// # Returns
/// * `Result<u64>` - The calculated LP tokens to mint, or `MathOverflow` on arithmetic failures.
pub fn calculate_lp_amount(
    amount_a: u64,
    amount_b: u64,
    reserve_a: u64,
    reserve_b: u64,
    total_lp_supply: u64,
) -> Result<u64> {
    if total_lp_supply == 0 {
        let product = (amount_a as u128)
            .checked_mul(amount_b as u128)
            .ok_or(error!(SoldexError::MathOverflow))?;
        let lp_amount = pure_integer_sqrt(product)?;
        Ok(lp_amount)
    } else {
        let lp_a = (amount_a as u128)
            .checked_mul(total_lp_supply as u128)
            .ok_or(error!(SoldexError::MathOverflow))?
            .checked_div(reserve_a as u128)
            .ok_or(error!(SoldexError::MathOverflow))?;

        let lp_b = (amount_b as u128)
            .checked_mul(total_lp_supply as u128)
            .ok_or(error!(SoldexError::MathOverflow))?
            .checked_div(reserve_b as u128)
            .ok_or(error!(SoldexError::MathOverflow))?;

        let lp_amount = std::cmp::min(lp_a, lp_b);
        Ok(lp_amount as u64)
    }
}

/// Calculates the output amount for a constant-product swap based on the Uniswap V2 AMM model.
///
/// Formula:
/// `amount_in_with_fee = amount_in * 997`
/// `numerator = amount_in_with_fee * reserve_out`
/// `denominator = reserve_in * 1000 + amount_in_with_fee`
/// `amount_out = numerator / denominator`
///
/// # Arguments
/// * `amount_in` - The incoming amount of input tokens.
/// * `reserve_in` - The pool reserve of the input token.
/// * `reserve_out` - The pool reserve of the output token.
///
/// # Returns
/// * `Result<u64>` - The calculated output tokens, or `MathOverflow` / `InsufficientLiquidity` on validation failure.
pub fn get_amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64) -> Result<u64> {
    if amount_in == 0 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }
    if reserve_in == 0 || reserve_out == 0 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    let amount_in_with_fee = (amount_in as u128)
        .checked_mul(997)
        .ok_or(error!(SoldexError::MathOverflow))?;

    let numerator = amount_in_with_fee
        .checked_mul(reserve_out as u128)
        .ok_or(error!(SoldexError::MathOverflow))?;

    let denominator = (reserve_in as u128)
        .checked_mul(1000)
        .ok_or(error!(SoldexError::MathOverflow))?
        .checked_add(amount_in_with_fee)
        .ok_or(error!(SoldexError::MathOverflow))?;

    if denominator == 0 {
        return Err(error!(SoldexError::MathOverflow));
    }

    let amount_out = numerator
        .checked_div(denominator)
        .ok_or(error!(SoldexError::MathOverflow))?;

    if amount_out == 0 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    if amount_out >= reserve_out as u128 {
        return Err(error!(SoldexError::InsufficientLiquidity));
    }

    Ok(amount_out as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pure_integer_sqrt() {
        assert_eq!(pure_integer_sqrt(0).unwrap(), 0);
        assert_eq!(pure_integer_sqrt(1).unwrap(), 1);
        assert_eq!(pure_integer_sqrt(2).unwrap(), 1);
        assert_eq!(pure_integer_sqrt(3).unwrap(), 1);
        assert_eq!(pure_integer_sqrt(4).unwrap(), 2);
        assert_eq!(pure_integer_sqrt(9).unwrap(), 3);
        assert_eq!(pure_integer_sqrt(100).unwrap(), 10);
        assert_eq!(pure_integer_sqrt(1000000).unwrap(), 1000);
        assert_eq!(pure_integer_sqrt(1000000000000).unwrap(), 1000000);
        assert_eq!(pure_integer_sqrt(u128::MAX).unwrap(), u64::MAX);
    }

    #[test]
    fn test_calculate_lp_amount() {
        // Initial liquidity
        assert_eq!(calculate_lp_amount(100, 100, 0, 0, 0).unwrap(), 100);
        assert_eq!(calculate_lp_amount(1000000, 4000000, 0, 0, 0).unwrap(), 2000000);

        // Proportional liquidity
        assert_eq!(calculate_lp_amount(50, 50, 100, 100, 100).unwrap(), 50);
        assert_eq!(calculate_lp_amount(50, 100, 100, 100, 100).unwrap(), 50); // limited by token A
        assert_eq!(calculate_lp_amount(100, 50, 100, 100, 100).unwrap(), 50); // limited by token B
    }

    #[test]
    fn test_get_amount_out() {
        // Swap A -> B
        // amount_in = 10, reserve_in = 100, reserve_out = 100
        // amount_in_with_fee = 10 * 997 = 9970
        // numerator = 9970 * 100 = 997000
        // denominator = 100 * 1000 + 9970 = 109970
        // amount_out = 997000 / 109970 = 9
        assert_eq!(get_amount_out(10, 100, 100).unwrap(), 9);

        // Swap B -> A (same logic)
        assert_eq!(get_amount_out(1000, 100000, 100000).unwrap(), 987);

        assert!(get_amount_out(0, 100, 100).is_err());
        assert!(get_amount_out(10, 0, 100).is_err());
        assert!(get_amount_out(10, 100, 0).is_err());
    }
}
