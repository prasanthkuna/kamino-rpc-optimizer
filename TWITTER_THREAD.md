# 🧵 Thread: The 30% Kamino Optimization

1/7
I just cut 30% of RPC bandwidth for Kamino liquidators. ✂️

Every `Obligation` fetch on Solana wastes 1,000 bytes.
Across 127k accounts, that's ~330 TB/month of useless egress.

Here’s how we fixed it with 5 chars of code. 🧵👇
[Asset: benchmark.png]

2/7
The Culprit: `Obligation` layout.

Total size: 3,344 bytes.
But wait...
- Bytes 0-2344: Critical data (Deposits, Borrows, LTV) 🔥
- Bytes 2344-3344: `orders[2]` + `padding[93]` ❄️

The "Orders" are only needed *during* liquidation execution.
The "Padding" is literally empty space.

[Asset: layout.png]

3/7
Liquidation bots run in a tight loop:
Fetch -> Check Health -> Liquidate (maybe).

99% of checks are healthy.
Why fetch the drag (Orders/Padding) every single time?

We don't need it. So we cut it.

4/7
The Fix: `dataSlice` 🔪

Solana's RPC has a hidden gem parameter.
We just tell the node: "Keep the first 2,344 bytes. Drop the rest."

```typescript
connection.getProgramAccounts(KAMINO_PROGRAM_ID, {
  filters: [{ dataSize: 3344 }],
  dataSlice: { offset: 0, length: 2344 } // <-- The Magic
});
```

5/7
The Results (Mainnet Benchmark) 📊

Tested against 127,778 real accounts.
🔴 Standard: 427 MB payload
🟢 Optimized: 300 MB payload

📉 Delta: -29.9% bandwidth.
That's 1KB saved per account check.

6/7
Why does this matter?

If you poll every minute:
127k accounts * 1KB * 60 * 24 * 30 = **331 TB** saved/month.

At AWS egress rates ($0.09/GB), that’s ~$30k/month in potential savings for the ecosystem.
Plus faster deserialization (less CPU).

7/7
Open Source & Ready to Use 📦

I packaged this into a drop-in optimizer.
Full benchmark script included.

🔗 https://github.com/prasanthkuna/kamino-rpc-optimizer

Part of my "Solana RPC Optimizers" portfolio.
Next up: Jito Latency Arbitrage. ⚡️
