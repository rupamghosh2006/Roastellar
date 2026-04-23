# Roastellar

A fully on-chain roast battle platform built on Stellar Soroban.

## Smart Contract

**Contract ID (Testnet):** `CBSSWTY2IX3Y4UAE2S7FT4TX25FS65QFCKR4JYZVMNXIKTKCBF3TF3OJ`

**Network:** Stellar Testnet  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CBSSWTY2IX3Y4UAE2S7FT4TX25FS65QFCKR4JYZVMNXIKTKCBF3TF3OJ

## Quick Start

### Build Contract

```bash
cd contracts/roastellar
rustup target add wasm32v1-none
cargo build --target wasm32v1-none --release
```

### Test

```bash
cargo test
```

### Deploy

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/roastellar.wasm \
  --source <your-key> \
  --network testnet
```

## Features

- User registration with username and XP system
- Roast battle matches with entry fees
- Spectator voting and predictions
- IPFS storage for roast content
- Automatic prize distribution (1% platform fee)
- Draw refunds
- Badge rewards (FirstWin, FiveWins, TenMatches)

## License

MIT