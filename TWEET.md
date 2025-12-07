1/2
Just cut 30% of RPC bandwidth for @KaminoFinance liquidators. ✂️

Every `Obligation` fetch wastes 1,000 bytes on unused orders/padding.
Fixed it with 5 chars of code (`dataSlice`).

Benchmarked on Mainnet (127k accounts):
🔴 427 MB (Standard)
🟢 300 MB (Optimized)
📉 -30% Payload

[Attach: benchmark.png]

2/2
That’s ~330 TB/month of useless egress saved across the ecosystem. 💸
Less bandwidth = lower latency = faster liquidations.

Open sourced the optimizer + benchmark script 👇
https://github.com/prasanthkuna/kamino-rpc-optimizer

cc @y2kappa @trader_marky @solana 

[Attach: layout.png]
