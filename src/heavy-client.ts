/**
 * Kamino Heavy Client
 * 
 * Fetches FULL Obligation accounts (3,344 bytes each)
 * This is the baseline for comparison.
 */

import { Connection, GetProgramAccountsFilter } from "@solana/web3.js";
import { KAMINO_PROGRAM_ID, RPC_URL, OBLIGATION_TOTAL_SIZE } from "./constants";

export interface HeavyFetchResult {
    accountCount: number;
    totalBytes: number;
    timeMs: number;
    bytesPerAccount: number;
}

export async function fetchHeavyObligations(): Promise<HeavyFetchResult> {
    const connection = new Connection(RPC_URL, "confirmed");

    const filters: GetProgramAccountsFilter[] = [
        { dataSize: OBLIGATION_TOTAL_SIZE }
    ];

    const startTime = performance.now();

    const accounts = await connection.getProgramAccounts(KAMINO_PROGRAM_ID, {
        filters,
        encoding: "base64",
    });

    const endTime = performance.now();

    const totalBytes = accounts.reduce((sum, acc) => sum + acc.account.data.length, 0);

    return {
        accountCount: accounts.length,
        totalBytes,
        timeMs: endTime - startTime,
        bytesPerAccount: OBLIGATION_TOTAL_SIZE,
    };
}
