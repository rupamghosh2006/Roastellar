# Roastellar

A fully on-chain roast battle platform built on Stellar Soroban.

## Smart Contract

**Contract ID (Testnet):** `CARHXRUOPEG7X4JTRJ64JUJB2FCRBMUOYECTZTMOKCPPKZGLKW36XCQ2`

**Network:** Stellar Testnet  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CARHXRUOPEG7X4JTRJ64JUJB2FCRBMUOYECTZTMOKCPPKZGLKW36XCQ2

## Quick Start

### Backend Env For Real Soroban Tx

Set these in Render backend env:

```bash
STELLAR_CONTRACT_ID=CARHXRUOPEG7X4JTRJ64JUJB2FCRBMUOYECTZTMOKCPPKZGLKW36XCQ2
STELLAR_BATTLE_SECRET=<deployer secret key>
STELLAR_BATTLE_PUBLIC=GAYWZSX43WUBRHM3F2QCWBL6ZOYSH7V5EOQOYMG6SMTGMM24RFEFCMHC
STELLAR_ESCROW_SECRET=<escrow secret key>
STELLAR_ESCROW_PUBLIC=<escrow public key>
STELLAR_CREATE_MATCH_FN=create_match
STELLAR_JOIN_MATCH_FN=join_match
STELLAR_SUBMIT_ROAST_FN=submit_roast
STELLAR_VOTE_FN=vote
STELLAR_PREDICT_FN=predict
STELLAR_FINALIZE_MATCH_FN=finalize_match
STELLAR_REFUND_DRAW_FN=finalize_match
BATTLE_VOTE_STAKE_XLM=0
```

Without these keys, backend cannot execute full mirrored on-chain lifecycle + XLM escrow transfers.

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
