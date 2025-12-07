/**
 * Kamino Lean Client
 * 
 * Fetches SLICED Obligation accounts (2,344 bytes each)
 * Cuts orders[2] and padding3[93] from the tail.
 */

import { Connection, GetProgramAccountsFilter } from "@solana/web3.js";
import { KAMINO_PROGRAM_ID, RPC_URL, OBLIGATION_TOTAL_SIZE, OBLIGATION_LEAN_SIZE } from "./constants";

export interface LeanFetchResult {
    accountCount: number;
    totalBytes: number;
    timeMs: number;
    bytesPerAccount: number;
}

export async function fetchLeanObligations(): Promise<LeanFetchResult> {
    const connection = new Connection(RPC_URL, "confirmed");

    const filters: GetProgramAccountsFilter[] = [
        { dataSize: OBLIGATION_TOTAL_SIZE }  // Still filter by full size
    ];

    const startTime = performance.now();

    const accounts = await connection.getProgramAccounts(KAMINO_PROGRAM_ID, {
        filters,
        encoding: "base64",
        dataSlice: {
            offset: 0,
            length: OBLIGATION_LEAN_SIZE,  // Only fetch first 2,344 bytes
        },
    });

    const endTime = performance.now();

    const totalBytes = accounts.reduce((sum, acc) => sum + acc.account.data.length, 0);

    return {
        accountCount: accounts.length,
        totalBytes,
        timeMs: endTime - startTime,
        bytesPerAccount: OBLIGATION_LEAN_SIZE,
    };
}
