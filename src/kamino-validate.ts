/**
 * Kamino Obligation Offset Validator
 * 
 * This script fetches a real Kamino Obligation account from Mainnet
 * and validates that bytes 2344+ are orders/padding (cuttable).
 */

import { Connection, PublicKey } from "@solana/web3.js";

// Kamino Lend Program ID (verified from Solscan)
const KAMINO_KLEND_PROGRAM = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");

// RPC URL (Helius)
const RPC_URL = process.env.RPC_URL || "https://mainnet.helius-rpc.com/?api-key=a909e89e-5ab3-474d-a00d-96a676756d9f";

// Validated byte layout from Rust source analysis
const OBLIGATION_LAYOUT = {
    // Header
    discriminator: 8,
    tag: 8,
    lastUpdate: 16,
    lendingMarket: 32,
    owner: 32,

    // Core data (KEEP)
    deposits: 8 * 136,        // [ObligationCollateral; 8] = 1088 bytes
    lowestLtv: 8,
    depositedValue: 16,
    borrows: 5 * 200,         // [ObligationLiquidity; 5] = 1000 bytes
    scalarValues: 64,         // 4 x u128
    miscFlags: 56,            // various u8 and pubkey
    timestamps: 16,           // 2 x u64

    // Tail (CUT)
    orders: 2 * 128,          // [ObligationOrder; 2] = 256 bytes
    padding: 93 * 8,          // [u64; 93] = 744 bytes
};

// Calculate offsets
const HEADER_SIZE = OBLIGATION_LAYOUT.discriminator + OBLIGATION_LAYOUT.tag +
    OBLIGATION_LAYOUT.lastUpdate + OBLIGATION_LAYOUT.lendingMarket +
    OBLIGATION_LAYOUT.owner;

const KEEP_SIZE = HEADER_SIZE + OBLIGATION_LAYOUT.deposits + OBLIGATION_LAYOUT.lowestLtv +
    OBLIGATION_LAYOUT.depositedValue + OBLIGATION_LAYOUT.borrows +
    OBLIGATION_LAYOUT.scalarValues + OBLIGATION_LAYOUT.miscFlags +
    OBLIGATION_LAYOUT.timestamps;

const CUT_SIZE = OBLIGATION_LAYOUT.orders + OBLIGATION_LAYOUT.padding;
const TOTAL_SIZE = KEEP_SIZE + CUT_SIZE;

console.log("═══════════════════════════════════════════════════════════════");
console.log("           KAMINO OBLIGATION BYTE LAYOUT VALIDATION            ");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`Header Size:     ${HEADER_SIZE} bytes`);
console.log(`Keep Size:       ${KEEP_SIZE} bytes`);
console.log(`Cut Size:        ${CUT_SIZE} bytes (Orders: ${OBLIGATION_LAYOUT.orders} + Padding: ${OBLIGATION_LAYOUT.padding})`);
console.log(`Total Size:      ${TOTAL_SIZE} bytes`);
console.log(`Savings:         ${((CUT_SIZE / TOTAL_SIZE) * 100).toFixed(1)}%`);
console.log("═══════════════════════════════════════════════════════════════");

async function fetchRealObligation() {
    const connection = new Connection(RPC_URL, "confirmed");

    console.log("\n🔍 Fetching real Kamino Obligation accounts from Mainnet...");

    // Fetch a few Obligation accounts to validate
    const accounts = await connection.getProgramAccounts(KAMINO_KLEND_PROGRAM, {
        dataSlice: { offset: 0, length: 0 }, // Just get account info, not data
        filters: [
            { dataSize: TOTAL_SIZE } // Filter for Obligation accounts
        ],
    });

    console.log(`Found ${accounts.length} Obligation accounts with size ${TOTAL_SIZE} bytes`);

    if (accounts.length === 0) {
        console.log("⚠️ No accounts found with expected size. Trying without filter...");

        // Try fetching without size filter to see what sizes exist
        const allAccounts = await connection.getProgramAccounts(KAMINO_KLEND_PROGRAM, {
            dataSlice: { offset: 0, length: 8 }, // Just discriminator
        });

        console.log(`Found ${allAccounts.length} total accounts in Kamino program`);

        if (allAccounts.length > 0) {
            // Get full data of first account to check size
            const fullAccount = await connection.getAccountInfo(allAccounts[0].pubkey);
            console.log(`First account size: ${fullAccount?.data.length} bytes`);
        }
        return;
    }

    // Fetch full data of first Obligation
    const sampleAccount = await connection.getAccountInfo(accounts[0].pubkey);

    if (!sampleAccount) {
        console.log("❌ Failed to fetch sample account");
        return;
    }

    console.log(`\n✅ Sample Obligation: ${accounts[0].pubkey.toBase58()}`);
    console.log(`   Data Length: ${sampleAccount.data.length} bytes`);

    // Analyze the tail (bytes after KEEP_SIZE)
    const tailBytes = sampleAccount.data.slice(KEEP_SIZE);
    const nonZeroInTail = tailBytes.filter(b => b !== 0).length;

    console.log(`\n📊 Tail Analysis (bytes ${KEEP_SIZE} to ${sampleAccount.data.length}):`);
    console.log(`   Tail Size: ${tailBytes.length} bytes`);
    console.log(`   Non-zero bytes: ${nonZeroInTail} (${((nonZeroInTail / tailBytes.length) * 100).toFixed(1)}%)`);

    if (nonZeroInTail < tailBytes.length * 0.1) {
        console.log(`\n🎯 VALIDATION PASSED: Tail is >90% zeros. Safe to cut!`);
        console.log(`   dataSlice: { offset: 0, length: ${KEEP_SIZE} }`);
        console.log(`   Savings: ${CUT_SIZE} bytes per account (${((CUT_SIZE / TOTAL_SIZE) * 100).toFixed(1)}%)`);
    } else {
        console.log(`\n⚠️ WARNING: Tail contains significant data. Review before cutting.`);
    }
}

fetchRealObligation().catch(console.error);
