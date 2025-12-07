/**
 * Kamino RPC Optimizer - Constants
 * 
 * Validated from Mainnet on Dec 7, 2024
 */

import { PublicKey } from "@solana/web3.js";

// Kamino Lend Program ID (verified from Solscan)
export const KAMINO_PROGRAM_ID = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");

// RPC Configuration
export const RPC_URL = process.env.RPC_URL || "https://mainnet.helius-rpc.com/?api-key=a909e89e-5ab3-474d-a00d-96a676756d9f";

// Obligation Account Sizes (validated from Mainnet)
export const OBLIGATION_TOTAL_SIZE = 3344;  // Full account size
export const OBLIGATION_LEAN_SIZE = 2344;   // Cut point (before orders + padding)
export const OBLIGATION_WASTE_SIZE = 1000;  // orders[2] + padding3[93]

// Byte layout breakdown
export const OBLIGATION_LAYOUT = {
    discriminator: 8,
    tag: 8,
    lastUpdate: 16,
    lendingMarket: 32,
    owner: 32,
    deposits: 8 * 136,      // [ObligationCollateral; 8] = 1088 bytes
    lowestLtv: 8,
    depositedValue: 16,
    borrows: 5 * 200,       // [ObligationLiquidity; 5] = 1000 bytes
    scalarValues: 64,       // 4 x u128
    miscFlags: 56,          // various u8 and pubkey
    timestamps: 16,         // 2 x u64
    // TAIL (CUT)
    orders: 2 * 128,        // [ObligationOrder; 2] = 256 bytes
    padding: 93 * 8,        // [u64; 93] = 744 bytes
};

// Benchmark settings
export const BENCHMARK_CONFIG = {
    warmupRuns: 2,
    benchmarkRuns: 3,
};
