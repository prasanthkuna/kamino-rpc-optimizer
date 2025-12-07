# Kamino RPC Optimizer

> **29.9% bandwidth reduction** for Kamino Lending liquidators.  
> 1,000 bytes saved per account fetch. **331 TB/month** at scale.

---

## The Problem

Every Kamino `Obligation` account is **3,344 bytes**.

But liquidation bots only need **deposits + borrows + health values** to detect opportunities.

**What's wasted:**
| Field | Size | Purpose |
|-------|------|---------|
| `orders[2]` | 256 B | Only for order execution |
| `padding[93]` | 744 B | Reserved (literally zeros) |
| **Total Waste** | **1,000 B** | **29.9%** of every fetch |

---

## The Fix

```diff
  connection.getProgramAccounts(KAMINO_PROGRAM_ID, {
    filters: [{ dataSize: 3344 }],
+   dataSlice: { offset: 0, length: 2344 }  // Cut the tail
  });
```

**5 characters. 30% savings.**

---

## Benchmark Results

Tested against **127,778 Kamino Obligations** on Solana Mainnet:

| Metric | Heavy | Lean | Delta |
|--------|-------|------|-------|
| **Payload** | 427.29 MB | 299.51 MB | **-29.9%** |
| **Per-Account** | 3,344 B | 2,344 B | **-1,000 B** |

### Unit Economics

| Metric | Value |
|--------|-------|
| Accounts on Mainnet | 127,778 |
| Bytes saved per poll | 127.8 MB |
| Polls per minute | 60 |
| **Monthly savings** | **331 TB** |

At $0.09/GB egress (AWS), that's **~$30k/month** across the ecosystem.

---

## Technical Deep Dive

### Obligation Memory Layout

```
┌─────────────────────────────────────────────────────────────┐
│ BYTE 0                                          BYTE 3,344  │
├─────────────────────────────────────────────────────────────┤
│ header │ deposits[8] │ borrows[5] │ scalars │ orders │ pad │
│  96 B  │   1,088 B   │  1,000 B   │  160 B  │ 256 B  │744 B│
├─────────────────────────────────────────────────────────────┤
│◄────────── KEEP (2,344 B) ──────────►│◄── CUT (1,000 B) ──►│
└─────────────────────────────────────────────────────────────┘
```

### Why This Works

1. **Liquidation trigger** = `deposited_value` vs `borrowed_value` (in KEEP region)
2. **Orders** = Only needed when *executing* liquidation (not detecting)
3. **Padding** = Literally zeros (validated on Mainnet)

### Mainnet Validation

```
📊 Tail Analysis (bytes 2344 to 3344):
   Non-zero bytes: 0 (0.0%)
   
🎯 VALIDATION PASSED: Tail is >90% zeros. Safe to cut!
```

---

## Usage

```bash
# Clone
git clone https://github.com/prasanthkuna/kamino-rpc-optimizer.git
cd kamino-rpc-optimizer

# Install
bun install

# Run benchmark
bun run benchmark

# Validate offset on Mainnet
bun run validate
```

---

## File Structure

```
src/
├── constants.ts     # Program ID, sizes (validated from Rust source)
├── heavy-client.ts  # Full 3,344 byte fetch (baseline)
├── lean-client.ts   # Sliced 2,344 byte fetch (optimized)
├── benchmark.ts     # Heavy vs Lean comparison
└── validate.ts      # Offset validation script
```

---

## Related Work

This is part of a cross-protocol RPC optimization portfolio:

| Protocol | Reduction | Repo |
|----------|-----------|------|
| **Drift** | 46% | [drift-rpc-optimizer](https://github.com/prasanthkuna/drift-rpc-optimizer) |
| **Kamino** | 29.9% | This repo |
| **Jito** | Coming soon | — |

---

## Author

**Prasanth Kuna**  
Solana Systems Engineer  
[@prasanthkuna](https://twitter.com/prasanthkuna)

---

## License

MIT
