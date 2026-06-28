use anchor_lang::prelude::*;

pub mod constants;
pub mod contexts;
pub mod error;
pub mod processor;
pub mod state;

use contexts::*;

declare_id!("8KSsmmLyR35acaVM9o9EiQgYyV3PFrGKqzYLCcck8qSH");

#[program]
pub mod soldex {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_bps: u16,
    ) -> Result<()> {
        processor::initialize_pool(ctx, fee_bps)
    }
}