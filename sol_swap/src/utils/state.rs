#[derive(Debug)]
pub struct PoolState {
    pub ini_reserve: u64,
    pub adhee_reserve: u64,
}

impl PoolState {
    pub fn new() -> Self {
        Self {
            ini_reserve: 0,
            adhee_reserve: 0,
        }
    }

    pub fn display(&self) {
        println!(
            "Pool Reserves => INI: {}, ADHEE: {}",
            self.ini_reserve,
            self.adhee_reserve
        );
    }
}