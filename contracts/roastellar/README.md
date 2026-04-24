# Roastellar - Soroban Smart Contract

A fully on-chain roast battle and prediction platform on Stellar testnet.

## Contract Address (Testnet)

```
CAD2N32J72CAIN5E7OSI3FKTRI6UEHUCF6HCHSAYDAKZK2ZPTR5A77ZJ
```

**Network:** Stellar Testnet  
**Explorer:** https://stellar.expert/explorer/testnet/contract/CAD2N32J72CAIN5E7OSI3FKTRI6UEHUCF6HCHSAYDAKZK2ZPTR5A77ZJ

## Overview

Roastellar is a Soroban smart contract that enables:
- Two players to join a roast contest by paying entry fees
- Spectators to vote and predict winners by staking tokens
- Roast content stored on IPFS (only CID hashes on-chain)
- Automatic reward distribution with 1% platform fee
- Full refunds on draws

## Build & Test Results

**All 10 tests PASSED:**
- test_register_user ✓
- test_duplicate_registration ✓  
- test_create_and_join_match ✓
- test_submit_roast ✓
- test_vote ✓
- test_double_vote_prevented ✓
- test_prediction ✓
- test_finalize_winner ✓
- test_draw_match ✓
- test_badge_award ✓

## Data Structures

### User
- address: Account address
- username: Display name
- xp: Experience points
- wins: Number of wins
- losses: Number of losses
- rank_points: Tournament ranking points
- profile_cid: IPFS CID for profile

### Match
- match_id: Unique match identifier
- creator: Match creator
- player1: First player
- player2: Second player
- entry_fee: Required entry fee
- topic_cid: IPFS CID for roast topic
- roast1_cid: Player 1's roast IPFS CID
- roast2_cid: Player 2's roast IPFS CID
- status: open, active, ended, draw
- winner: Winner address
- votes_player1: Vote count for player 1
- votes_player2: Vote count for player 2
- created_at: Creation timestamp

### Prediction
- predictor: Prediction maker
- selected_player: Predicted winner
- amount: Staked amount

## Contract Functions

### User System
- `register_user(user, username, profile_cid)` - Register new user
- `get_user(user)` - Get user data
- `update_profile(user, profile_cid)` - Update profile

### Match System
- `create_match(entry_fee, topic_cid, user)` - Create new match
- `join_match(match_id, player)` - Join existing match
- `submit_roast(match_id, roast_cid, player)` - Submit roast content
- `vote(match_id, selected_player, voter)` - Vote for winner
- `finalize_match(match_id)` - Finalize and distribute rewards
- `get_match(match_id)` - Get match data

### Prediction System
- `predict(match_id, selected_player, amount, predictor)` - Place prediction

### Badge System
- `has_badge(user, badge)` - Check if user has badge

## Badges

- **FirstWin** - Awarded on first win
- **FiveWins** - Awarded after 5 wins
- **TenMatches** - Awarded after 10 matches

## Reward Logic

1. Total player pool = entry_fee × 2
2. Deduct 1% platform fee
3. Send remaining to winner
4. Distribute prediction pool among correct predictors proportionally

## Draw Logic

If votes are equal:
- Mark as draw
- Refund players full entry fee
- Refund predictors full stake
- No platform fee charged

## Build

```bash
# Install Rust and WASM target
rustup target add wasm32v1-none

# Build
cargo build --target wasm32v1-none --release

# Output: target/wasm32v1-none/release/roastellar.wasm
```

## Test

```bash
cargo test
```

## Deploy to Testnet

```bash
# Using Stellar CLI
stellar contract deploy \
  --wasm target/wasm32v1-none/release/roastellar.wasm \
  --source <your-key> \
  --network testnet
```

## Interact with Contract

```bash
# Register user
stellar contract invoke \
  --id CAD2N32J72CAIN5E7OSI3FKTRI6UEHUCF6HCHSAYDAKZK2ZPTR5A77ZJ \
  --source testkey \
  --network testnet \
  -- register_user \
  --user G... \
  --username "username" \
  --profile_cid "ipfs-cid"

# Create match
stellar contract invoke \
  --id CAD2N32J72CAIN5E7OSI3FKTRI6UEHUCF6HCHSAYDAKZK2ZPTR5A77ZJ \
  --source testkey \
  --network testnet \
  -- create_match \
  --user G... \
  --topic_cid "roast-topic" \
  --entry_fee 1000000

# Get match
stellar contract invoke \
  --id CAD2N32J72CAIN5E7OSI3FKTRI6UEHUCF6HCHSAYDAKZK2ZPTR5A77ZJ \
  --source testkey \
  --network testnet \
  -- get_match \
  --match_id 1
```

## Project Structure

```
Roastellar/
├── contracts/
│   └── roastellar/
│       ├── src/
│       │   └── lib.rs      # Contract source (~614 lines)
│       ├── Cargo.toml      # Dependencies
│       ├── README.md      # This file
│       └── target/        # Build output
├── stellar.exe           # Stellar CLI (prebuilt)
└── README.md             # Root README
```

## License

MIT
