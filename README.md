<p align="center">
  <img src="Frontend/public/logo.jpeg" alt="Roastellar Logo" width="200" />
</p>

# Roastellar

[![Contracts CI](https://github.com/rupamghosh2006/Roastellar/actions/workflows/contracts-ci.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/contracts-ci.yml)
[![Backend CI/CD](https://github.com/rupamghosh2006/Roastellar/actions/workflows/backend-ci-cd.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/backend-ci-cd.yml)
[![Frontend CI/CD](https://github.com/rupamghosh2006/Roastellar/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/frontend-ci-cd.yml)

A fully on-chain roast battle platform built on Stellar Soroban.

## Live Demo

**URL:** https://roastellar.vercel.app

**Demo Video:** https://youtu.be/iDdfbYiBElk

### Screenshots - Laptop View

![Home Page](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777471812/Screenshot_2026-04-29_193301_cdpq4l.png)

![Dashboard](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777471827/Screenshot_2026-04-29_193031_vh5hc3.png)

![Battles](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777471826/Screenshot_2026-04-29_193052_utxsyw.png)

![Battle Room](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777471810/Screenshot_2026-04-29_193230_kir3ce.png)

![Leaderboard](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777471810/Screenshot_2026-04-29_193219_upoxi9.png)

![Profile](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777471810/Screenshot_2026-04-29_193106_kpogwn.png)

### Screenshots - Mobile View

<p align="center">
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777472412/WhatsApp_Image_2026-04-29_at_7.45.44_PM_cizdt2.jpg" width="180" />
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777472413/WhatsApp_Image_2026-04-29_at_7.45.45_PM_1_wvip4x.jpg" width="180" />
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777472412/WhatsApp_Image_2026-04-29_at_7.45.45_PM_eeu8lw.jpg" width="180" />
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777472421/WhatsApp_Image_2026-04-29_at_7.45.44_PM_1_mwlch5.jpg" width="180" />
</p>

## Smart Contract

**Contract ID (Testnet):** `CARHXRUOPEG7X4JTRJ64JUJB2FCRBMUOYECTZTMOKCPPKZGLKW36XCQ2`

**Network:** Stellar Testnet
**Explorer:** https://stellar.expert/explorer/testnet/contract/CARHXRUOPEG7X4JTRJ64JUJB2FCRBMUOYECTZTMOKCPPKZGLKW36XCQ2

## Testnet Users (Verified)

| Name | Wallet Address | Rating |
|------|----------------|--------|
| Dipika Ghosh | `GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER` | 4/5 |
| Bodhisatwa Dutta | `GA6LENTHFAG3UY2HK7V24RBGYKIQTPLPG42G5QT26VILKB7KXLUR2ACI` | 4/5 |
| ABANTIKA KUNDU | `GC7WKLWFRYAOZTDXYXA3GB77HY4AQ5I2GAVEEHKE6IANJOEFZ524TYJO` | 5/5 |
| Anubhab Rakshit | `GBYXMIJU2W2NZTLI3WTT4H342KV7TOUVJOO5LYGXBA6MHDUKDRZ2GUSN` | 3/5 |
| Debasmit Bose | `GC53LJZ4V2CLF7NTWFKVSFWSPMKSVT7TABLDVZLT7A63HFHAY4DF4MKC` | 4/5 |
| Rakhi Kundu | `GDNNF4DU7LZF7SMXRCDCEQTBKV5733I2BUUDSOHDYK6NFUB4URN3XAJM` | 5/5 |

View all users on [Stellar Expert](https://stellar.expert/explorer/testnet/account/GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER)

## User Feedback

**Full Feedback Data:** [Google Sheets Export](https://docs.google.com/spreadsheets/d/1bQhjQawRHuge7KuS5utRJ055WBbf2KfnXiU75W_4m1o/edit?usp=sharing)

### Feedback Summary

| User | Key Feedback |
|------|--------------|
| Dipika Ghosh | Loved the game - rated 5/5 on UI, fun factor, and onboarding. All features work. |
| Bodhisatwa Dutta | UI feels hard-coded. Wallet reveal part needs improvement. |
| ABANTIKA KUNDU | Web2-like onboarding excellent. Voting not working properly (shows draw). |
| Anubhab Rakshit | Too many mock/demo parts in UI. Improve UX. |
| Debasmit Bose | Mobile responsive menu button useless. Need Clerk logout button. |
| Rakhi Kundu | Perfect experience - rated 5/5 on all aspects. Everything on point. |

### Common Themes
1. **Voting bugs** - Match shows draw even after voting
2. **UI/UX improvements** - Too many hardcoded/demo parts
3. **Mobile responsiveness** - Menu button redundancy
4. **Authentication** - Need logout functionality

## Next Iteration Improvements

Based on user feedback, the following improvements are planned:

### 1. Fix Voting Race Condition
- **Issue:** Voting not properly recorded, matches show draw
- **Commit:** https://github.com/rupamghosh2006/Roastellar/commit/532bd9c094b76e9ef50bd06cd54098a2b7e47eb5


### 2. Replace Hardcoded Demo Parts
- **Issue:** Users reported too many mock/static parts in UI
- **Commit:** https://github.com/rupamghosh2006/Roastellar/commit/dd66d9ea318a214ea4c3f4b9595261e636f78cf3

### 3. Mobile Responsive Improvements
- **Issue:** Top right menu button redundant (footer nav already exists)
- **Commit:** https://github.com/rupamghosh2006/Roastellar/commit/6d3fdb6a95fbf77fc207a9e2cd065e1b07084bf1

### 4. Logout button
- **Issue:** User needed a dedicated logout button
- **Commit:** https://github.com/rupamghosh2006/Roastellar/commit/fa368559be91147008b212585b30a98294be9c7c

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system architecture documentation.

## CI/CD Setup

This repo now includes GitHub Actions for:
- `contracts` CI: `/.github/workflows/contracts-ci.yml`
- `Backend` CI/CD with Render deploy hook: `/.github/workflows/backend-ci-cd.yml`
- `Frontend` CI/CD with Vercel CLI deploy: `/.github/workflows/frontend-ci-cd.yml`

### Required GitHub Secrets

Add these in your GitHub repo settings:
- `RENDER_DEPLOY_HOOK_URL`: Render Web Service deploy hook URL for backend.
- `VERCEL_TOKEN`: Vercel personal/team token with deploy access.

### Render Connection (Backend)

- `render.yaml` is added at repo root for Blueprint-based setup.
- Service is configured with `rootDir: Backend`, `buildCommand: npm ci`, `startCommand: npm start`.

### Vercel Connection (Frontend)

- `Frontend/vercel.json` is added for reproducible Next.js build/install commands.
- Link the `Frontend` folder to your Vercel project (`Root Directory = Frontend`).

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
