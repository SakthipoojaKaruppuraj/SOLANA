use anchor_lang::prelude::*;

pub mod constants;
pub mod contexts;
pub mod error;
pub mod processor;
pub mod state;
pub mod utils;

use contexts::*;

declare_id!("8KSsmmLyR35acaVM9o9EiQgYyV3PFrGKqzYLCcck8qSH");

#[program]
pub mod soldex {
    use super::*;

    /// Initialize a new liquidity pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_bps: u16,
    ) -> Result<()> {
        processor::initialize_pool(ctx, fee_bps)
    }

    /// Add liquidity into an existing pool
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        processor::add_liquidity(ctx, amount_a, amount_b)
    }

    /// Remove liquidity from the pool
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        lp_amount: u64,
    ) -> Result<()> {
        processor::remove_liquidity(ctx, lp_amount)
    }

    /// Swap Token A ↔ Token B
    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        processor::swap(ctx, amount_in, minimum_amount_out)
    }
}