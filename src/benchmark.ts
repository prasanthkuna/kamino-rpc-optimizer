/**
 * Kamino RPC Optimizer - Benchmark
 * 
 * Compares HEAVY (full) vs LEAN (sliced) Obligation fetches
 */

import { fetchHeavyObligations } from "./heavy-client";
import { fetchLeanObligations } from "./lean-client";
import { OBLIGATION_TOTAL_SIZE, OBLIGATION_LEAN_SIZE, OBLIGATION_WASTE_SIZE } from "./constants";

function formatBytes(bytes: number): string {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(2)} KB`;
    return `${bytes} B`;
}

function formatTime(ms: number): string {
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${ms.toFixed(0)}ms`;
}

async function runBenchmark() {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("       KAMINO RPC OPTIMIZER - BENCHMARK                        ");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Full Obligation:  ${OBLIGATION_TOTAL_SIZE} bytes`);
    console.log(`Lean Obligation:  ${OBLIGATION_LEAN_SIZE} bytes`);
    console.log(`Waste (cut):      ${OBLIGATION_WASTE_SIZE} bytes`);
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Warmup
    console.log("🔥 Warming up...");
    await fetchLeanObligations();

    // Heavy fetch
    console.log("📦 Running HEAVY fetch (full Obligation data)...");
    const heavyResult = await fetchHeavyObligations();
    console.log(`   Accounts: ${heavyResult.accountCount.toLocaleString()}`);
    console.log(`   Payload:  ${formatBytes(heavyResult.totalBytes)}`);
    console.log(`   Time:     ${formatTime(heavyResult.timeMs)}`);

    // Lean fetch
    console.log("\n🚀 Running LEAN fetch (sliced Obligation data)...");
    const leanResult = await fetchLeanObligations();
    console.log(`   Accounts: ${leanResult.accountCount.toLocaleString()}`);
    console.log(`   Payload:  ${formatBytes(leanResult.totalBytes)}`);
    console.log(`   Time:     ${formatTime(leanResult.timeMs)}`);

    // Comparison
    const byteSavings = ((heavyResult.totalBytes - leanResult.totalBytes) / heavyResult.totalBytes) * 100;
    const timeSavings = ((heavyResult.timeMs - leanResult.timeMs) / heavyResult.timeMs) * 100;

    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("       RESULTS                                                 ");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`| Metric        | Heavy        | Lean         | Delta         |`);
    console.log(`|---------------|--------------|--------------|---------------|`);
    console.log(`| Payload       | ${formatBytes(heavyResult.totalBytes).padEnd(12)} | ${formatBytes(leanResult.totalBytes).padEnd(12)} | -${byteSavings.toFixed(1)}%`.padEnd(69) + "|");
    console.log(`| Time          | ${formatTime(heavyResult.timeMs).padEnd(12)} | ${formatTime(leanResult.timeMs).padEnd(12)} | -${timeSavings.toFixed(1)}%`.padEnd(69) + "|");
    console.log(`| Per-Account   | ${heavyResult.bytesPerAccount} B`.padEnd(27) + `| ${leanResult.bytesPerAccount} B`.padEnd(14) + `| -${OBLIGATION_WASTE_SIZE} B`.padEnd(15) + "|");
    console.log("═══════════════════════════════════════════════════════════════");

    // Unit economics
    const pollsPerMonth = 60 * 60 * 24 * 30;
    const bytesPerMonth = leanResult.accountCount * OBLIGATION_WASTE_SIZE * pollsPerMonth;

    console.log("\n📊 Monthly Savings (at 1 poll/min):");
    console.log(`   Accounts:     ${leanResult.accountCount.toLocaleString()}`);
    console.log(`   Bytes saved:  ${formatBytes(bytesPerMonth)}/month`);
}

runBenchmark().catch(console.error);
