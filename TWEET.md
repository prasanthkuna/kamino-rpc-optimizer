Just cut 30% of RPC bandwidth for @KaminoFinance liquidators. ✂️

Every `Obligation` fetch wastes 1,000 bytes on orders/padding you don't need for health checks.
Across 127k accounts, that’s ~330 TB/month of useless egress.

Fixed it with 5 chars of code (`dataSlice`).
Benchmarked on Mainnet: 427MB -> 300MB (-30%). 📉

Open sourced the optimizer + benchmark 👇
https://github.com/prasanthkuna/kamino-rpc-optimizer

cc @y2kappa @trader_marky @solana 

[Attach: benchmark.png]
