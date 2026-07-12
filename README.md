<p align="center">
  <img src="Frontend/public/logo.jpeg" alt="Roastellar Logo" width="200" />
</p>

# Roastellar

[![Contracts CI](https://github.com/rupamghosh2006/Roastellar/actions/workflows/contracts-ci.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/contracts-ci.yml)
[![Backend CI/CD](https://github.com/rupamghosh2006/Roastellar/actions/workflows/backend-ci-cd.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/backend-ci-cd.yml)
[![Frontend CI/CD](https://github.com/rupamghosh2006/Roastellar/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/frontend-ci-cd.yml)

A fully on-chain roast battle platform built on Stellar Soroban.

## Quick Navigation

- **Live Demo (Vercel):** [https://roastellar.vercel.app](https://roastellar.vercel.app)
- **30+ User Wallet Addresses (Stellar-verifiable):**
  - Table in this README: [Testnet Users (Verified)](#testnet-users-verified)
  - Source sheet (30 users): [Google Sheet](https://docs.google.com/spreadsheets/d/1rSuNXtO64Es7leAAnP5zJ5c3lW_7HQTvoOU-yRK8lsc/edit?usp=sharing)
  - Explorer sample: [Stellar Expert Account](https://stellar.expert/explorer/testnet/account/GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER)
- **10+ June 2026 Onboarded Users:** [June 2026 Onboarded Users](#june-2026-onboarded-users)
- **June Issue Resolved — Sign-In Flow Fix (User Feedback):** [Sign-In Flow Fix](#sign-in-flow-fix)
- **Metrics Dashboard (Screenshot):** [Metrics Dashboard](#metrics-dashboard)
  <!-- - API endpoint: [https://roastellar.onrender.com/api/analytics/metrics](https://roastellar.onrender.com/api/analytics/metrics) -->
- **Monitoring Dashboard (Screenshot):** [Monitoring Active](#monitoring-active)
- **Completed Security Checklist:** [security_checklist.md](./security_checklist.md)
- **Community Contribution (Twitter/X Post):** [https://x.com/RupamGhosh2006/status/2049507507253768670](https://x.com/RupamGhosh2006/status/2049507507253768670)
- **Advanced Feature (Description + Proof):** [Advanced Feature: Fee Sponsorship](#advanced-feature-fee-sponsorship-gasless-transactions-via-fee-bump)
- **Data Indexing (Approach + Endpoint):** [Data Indexing](#data-indexing)

## Live Demo

**URL:** https://roastellar.vercel.app

**Demo Video:** https://youtu.be/iDdfbYiBElk

## Metrics Dashboard

![Metrics Dashboard](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777580625/Screenshot_2026-05-01_014932_ebwpai.png)


<!-- **Tracking Started On:** April 29, 2026 -->

### Screenshots - Laptop View

![Home Page](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777580848/Screenshot_2026-05-01_015629_h0q3jf.png)

![sign-in](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777580979/Screenshot_2026-05-01_015858_hmybsr.png)

![wallet](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777581085/Screenshot_2026-05-01_014217_jowynb.png)

![Battles](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777581315/Screenshot_2026-05-01_014242_irpvgg.png)

![Battle Room](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777581282/Screenshot_2026-05-01_015201_u8fk8o.png)

![Leaderboard](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777581166/Screenshot_2026-05-01_013604_cxtlce.png)

![Profile](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777581354/Screenshot_2026-05-01_014118_ed9fot.png)

![wallet-auth](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777581495/Screenshot_2026-05-01_020757_woz7tt.png)

### Screenshots - Mobile View

<p align="center">
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777616658/Screenshot_20260501_114435_anapof.jpg" width="180" />
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777616658/Screenshot_20260501_114448_aljk9x.jpg" width="180" />
</p>

<p align="center">
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777616658/Screenshot_20260501_114937_cnordq.jpg" width="180" />
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777616658/Screenshot_20260501_114945_vbnleu.jpg" width="180" />
</p>

<p align="center">
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777616658/Screenshot_20260501_114835_l9jhao.jpg" width="180" />
  <img src="https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777616658/Screenshot_20260501_114723_bc3z93.jpg" width="180" />
</p>

## Smart Contract

**Contract ID (Testnet):** `CB2NV4N7NEZFTNRBVZSZDH64RROI7FDPTIFWNXMQOAA5JB2BUWXG4BHW`

**Network:** Stellar Testnet
**Explorer:** https://stellar.expert/explorer/testnet/contract/CB2NV4N7NEZFTNRBVZSZDH64RROI7FDPTIFWNXMQOAA5JB2BUWXG4BHW

## Testnet Users (Verified)

| User Name | User Email | User Wallet Address |
|------|-------|---------------------|
| Dipika Ghosh | dipikaghosh791@gmail.com | `GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER` |
| Bodhisatwa Dutta | bodhisatwadutta025@gmail.com | `GA6LENTHFAG3UY2HK7V24RBGYKIQTPLPG42G5QT26VILKB7KXLUR2ACI` |
| ABANTIKA KUNDU | kunduabantika.123@gmail.com | `GC7WKLWFRYAOZTDXYXA3GB77HY4AQ5I2GAVEEHKE6IANJOEFZ524TYJO` |
| Anubhab Rakshit | anubhabrakshit.06@gmail.com | `GBYXMIJU2W2NZTLI3WTT4H342KV7TOUVJOO5LYGXBA6MHDUKDRZ2GUSN` |
| Debasmit Bose | debasmitbos22@gmail.com | `GC53LJZ4V2CLF7NTWFKVSFWSPMKSVT7TABLDVZLT7A63HFHAY4DF4MKC` |

### For Level 6

**Source Sheet (30 users):** https://docs.google.com/spreadsheets/d/1rSuNXtO64Es7leAAnP5zJ5c3lW_7HQTvoOU-yRK8lsc/edit?usp=sharing

| User Name | User Email | User Wallet Address |
|------|-------|---------------------|
| Saurav Mahato | mahatosaurav2006@gmail.com | `GBD3DLLDF2ZQYXEN77BR3CZYES6JAXJD3AN2LB5FTBT7Z5XWQGCZDW5U` |
| Subhajit Dasgupta | subhajit80@gmail.com | `GBFBON2CFNHUYNRBADN6NOSAUDGI6ZQ7ZIUWGP3K4IJ56ZUBHT2EAVXB` |
| Sayagnika Mollick | sayagnikamollick@gmail.com | `GBJNVAIT3OGVJNBYBTIIVTJFFEFPOOOQADKCR5D2LFG4KN2U5W6YWDL7` |
| Ankush Datta | ankushdatta712@gmail.com | `GAP2OOAJM3P5DBDICSK4AUWL4YTP6BMIYQAX6UHFY53HIA5C6C6E5SPG` |
| Arghya Paul | ap3163328@gmail.com | `GDU42AEUUG7BBLNKKLOKE35AKBZFQGT5SWKOOEZCPJHWM7MUN3IOHPDF` |
| Tamalika Ghosh | ghoshtamalika91@gmail.com | `GDE44HBLIANEIMYZDPPSSN7KMYHRKH4HVQJLHKIRODZZQZBVKQMOQU72` |
| Anika Haque | anikahaque0597@gmail.com | `GCSALHSW25CKS4BMJG75Q57E6GCFUZXDHLS47FEYSVSRFDD5TVBAZNXI` |
| Nilesh Halder | rh6262070@gmail.com | `GA26JSQLSVF6YLGCBNCE6MJIP4UBU36CE4BQZO65WF3STDJB7FHGXQPF` |
| Arghya | apaul19071001@gmail.com | `GDA2ZH52GBGP34SHW6WU45B55HGNCSVUICL4SN2CMOYIXHJ52JGP7ZOH` |
| Abantika Kundu | kunduabantika.123@gmail.com | `GC7WKLWFRYAOZTDXYXA3GB77HY4AQ5I2GAVEEHKE6IANJOEFZ524TYJO` |
| Ambika Nandy | Abantikakundu512@gmail.com | `GB67TYT4LQ2GSXALGZHZ5C26Z6RIEAE5IROLPKSOVUFMI6ZE7C5ENPHL` |
| Rani Kundu | ranikundu.kt@gmail.com | `GCIRDZXUXIDEC22HK3T6AX5RRQCW7ILOK77B7RJ52W5BXFDJ3AL2BWVL` |
| Ankana Lahiri | ankanalahi.bts@gmail.com | `GBFSD3VATX4KHMPMW6RG6DKNV5JXW5O373CLR2H7O3YHMYTJSMI4KITQ` |
| Ayantika Kundu | ayantikak484@gmail.com | `GB2LEZTGWAT777PGNTFOC4J2QRDRBYKTG5OSFUGG7QISTQEZZDUUNUGF` |
| Rupesh Raj | rajrupesh2485@gmail.com | `GD4GWP2RBZCR7P3ZQCEVCPBVZ3UXW5NVO4LFNK5H5KKGLLNY3CKMPBDT` |
| Sushobhan Mitra | sushobhanp59@gmail.com | `GCIIHXIXJW4VLXMSOAX2QJDTGIROJM7UIZLSFIFULV3C2MDQTFY3NN7C` |
| Sharmistha | johnsendi727@gmail.com | `GC7A2KEL45O53ERVCSKEOU5G5PXIJEM67UW6QBSOTVOLLKE2GLYPLP2O` |
| Sudip Saha | sudipshit668@gmail.com | `GBWFOOJI6YE32C3T6BBHHFK3ZZ2USEAFTWBKZA7UFD3OH6IMCNHGAR65` |
| TANCHAN | tanchangarai51@gmail.com | `GAUTYPM6KM7MIOH45COSKESN7WPK5ZGRSLULDSCVIXFJXCTHTB7MIDIA` |
| Raghu Prasad Sannigrahi | raghuprasadsannigrahi@gmail.com | `GDMMLMGYGSWQOGRC2OSUDZYCHQY7JO6TJV2KQSSMLWOWXSG6LNKIKJY6` |
| Abhinandan Kumar | sumankumarrajpati567@gmail.com | `GBWCFMRZRWDLKKSQCTWM3F623TETNUFNCJERPS5LH6SAVN5JYZODLXBG` |
| Subhajit Ghosh | jitsubha7980@gmail.com | `GCQJ7YCL5H3XGQK775XI6R62HSV6JSDDE7JMHTJVD4ENWV2US6KL3CB7` |
| Adi Sah | sahaaditya639@gmail.com | `GAGOUDLC4AXFDXPA4BTIR2KZ53BDZTUGLVVNV4J55RSDAG6ULXB3V7S2` |
| Srijan bhowmik | 2029ece02srijan@buie.ac.in | `GAVQE6CKQUIJOPID3I74SOJN2ISC6XLEZ7WXX5E4K2UM5S54AQ5V7C6Q` |
| Somsubhra Mitra | somsubhramitra2@gmail.com | `GC7XMPOXBDBJMPNQ5SQE2DTGACVSX4RHOUXE2XFF2SLHPDJNFGADTIHW` |
| Sreeja Samaddar | sreejasamaddar10@gmail.com | `GCWUUJPXH3FZLY2TCI67QODEXQOAHJN6G5CLGJVO55VBRKGJBB72NBJE` |
| Ishan Ray | ishanray1.02@gmail.com | `GD6Y2S3CK5JEDXT7XTA63BP43B6EO7API7MIZM6GYEYFZBIYMMWMNTQX` |
| Sourav | sv.sourav23@gmail.com | `GAJDI3UZB2JGUCDDHBUQKLXYI5336YSAUIP3SKIM5MZXXHIC3IS2NK46` |
| Subrata M | subratamajhi1207@gmail.com | `GAR7NJQ6QJJTXDABDQSPCFC6MC6A3XP6VD2Y6CTK4WRCIMDKIZX77QLF` |
| Dipika Ghosh | dipikaghosh791@gmail.com | `GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER` |

View all users on [Stellar Expert](https://stellar.expert/explorer/testnet/account/GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER)

## June 2026 Onboarded Users

10 new testnet users onboarded in June 2026:

| User Name | User Email | User Wallet Address | Onboarding Date |
|-----------|------------|---------------------|-----------------|
| Raunak Singh | Raunak537singh@gmail.com | `GDV7W3U4NX7X6Y5A23Z7B6M72VCLQ66PXZ7K6NY6L3I7Y42WW2DTEST3` | 29 Jun 2026 |
| RIJU DAS | riju.rj84kly@gmail.com | `GD3KITJCXYGTNIQOH2O7TPZOG6HE2NRHKXZXSPMPWVLVQ6JI72HXMDZB` | 29 Jun 2026 |
| PRATIK DUBE | pradube897@gmail.com | `GBV4DHWFLJQO6GHJXIN5S747EOXQGEEJA5BVOJHXLKD55XWHRUNWVV6Y` | 29 Jun 2026 |
| Shrikant Ajay Bhore | shrikantbhore56@gmail.com | `GAGQ4AEPOYTJ2VLWXEWOTLVDMQNYW44CPHTK5LVHYERAL5AIOCDLEODU` | 30 Jun 2026 |
| DISHA PAL | dishapalld9@gmail.com | `GC6JEOQTXDUZWQE6KTIFV5KKPT67UQR2SNILSZ6UZWZ5YYJRU27VYLRO` | 30 Jun 2026 |
| BIBHAS BANIK | bibbybon44@gmail.com | `GCDTCISXKC2JPBNGHPAYFK3MFQBX5YHO4OV3F2MJHR3HI2NFEIQNFF2E` | 30 Jun 2026 |
| URMI CHATTERJEE | peppaspip1212@gmail.com | `GC35DTKVPAIFHUU7PYOBKDEIM5FRXBSHQIWZBASA2IFRPN7VEQ5YZC24` | 30 Jun 2026 |
| MANIK LAL | maniklalvivo@gmail.com | `GB5GF6NA6DFHBS6EZLNYTKKI6ODFHM6PD772VWTJMU7IRF5IO4ZFL526` | 30 Jun 2026 |
| SNEHA DAS | sneeehaaaadas00@gmail.com | `GC4JRFZKUQQHXUE6BFDEQSYYP2YLSBS6MATKZJBJ3X2E56RGYLXWGO4X` | 30 Jun 2026 |
| Swarnali Rani Lodh | srlmusic8765@gmail.com | `GAH6LDNKDOMJK7FSM2ZH3NVUQZQQYFFPO3LWO27MFQLKF2DZ7K6QMWYN` | 30 Jun 2026 |

## User Feedback

**Full Feedback Data:** [Google Sheets Export](https://docs.google.com/spreadsheets/d/1bQhjQawRHuge7KuS5utRJ055WBbf2KfnXiU75W_4m1o/edit?usp=sharing)

### User Feedback Implementation

| User Name | User Email | User Wallet Address | User Feedback | Commit ID (Where changes made according to the user feedback) |
|----------|------------|---------------------|---------------|------------------------------|
| Dipika Ghosh | dipikaghosh791@gmail.com | `GBBWKRWNDY6HN3HD3BVAOPK3DYVFBPDR7ZQZ5BIMIZSGGP4BBB3BW5ER` | Overall positive experience, no specific issue reported. | N/A |
| Bodhisatwa Dutta | bodhisatwadutta025@gmail.com | `GA6LENTHFAG3UY2HK7V24RBGYKIQTPLPG42G5QT26VILKB7KXLUR2ACI` | UI looks hard coded, wallet reveal part needs improvement. | `dd66d9ea318a214ea4c3f4b9595261e636f78cf3` |
| ABANTIKA KUNDU | kunduabantika.123@gmail.com | `GC7WKLWFRYAOZTDXYXA3GB77HY4AQ5I2GAVEEHKE6IANJOEFZ524TYJO` | Voting issue: match still shows draw after voting. | `532bd9c094b76e9ef50bd06cd54098a2b7e47eb5` |
| Anubhab Rakshit | anubhabrakshit.06@gmail.com | `GBYXMIJU2W2NZTLI3WTT4H342KV7TOUVJOO5LYGXBA6MHDUKDRZ2GUSN` | Improve UI/UX, reduce mock/demo parts. | `dd66d9ea318a214ea4c3f4b9595261e636f78cf3` |
| Debasmit Bose | debasmitbos22@gmail.com | `GC53LJZ4V2CLF7NTWFKVSFWSPMKSVT7TABLDVZLT7A63HFHAY4DF4MKC` | Mobile menu button redundant; add Clerk logout button. | `6d3fdb6a95fbf77fc207a9e2cd065e1b07084bf1`, `fa368559be91147008b212585b30a98294be9c7c` |

### Sign-In Flow Fix (June 2026 Issue Resolved)

Two users reported in late June 2026 that signing in as a new user showed a 404 error instead of redirecting to the sign-up page. This was resolved in commit `41188a1` by detecting Clerk's `form_identifier_not_found` error and automatically redirecting to `/sign-up`.

| User Name | User Email | User Wallet Address | User Feedback | Feedback Date | Commit ID |
|-----------|------------|---------------------|---------------|---------------|-----------|
| RIJU DAS | riju.rj84kly@gmail.com | `GD3KITJCXYGTNIQOH2O7TPZOG6HE2NRHKXZXSPMPWVLVQ6JI72HXMDZB` | Sign-in showed 404 user not found instead of redirecting to sign-up. | 29 Jun 2026 | `41188a1` |
| BIBHAS BANIK | bibbybon44@gmail.com | `GCDTCISXKC2JPBNGHPAYFK3MFQBX5YHO4OV3F2MJHR3HI2NFEIQNFF2E` | Sign-in showed 404 error and didn't redirect to sign-up for new users. | 30 Jun 2026 | `41188a1` |

<!-- ## Next Iteration Improvements

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
- **Commit:** https://github.com/rupamghosh2006/Roastellar/commit/fa368559be91147008b212585b30a98294be9c7c -->

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system architecture documentation.

## Security

Link: [completed security checklist](./security_checklist.md)

## Advanced Feature: Fee Sponsorship (Gasless Transactions via Fee Bump)

### Description

Roastellar implements **Fee Sponsorship** so end-user actions can run in a gasless UX mode where a sponsor account pays network fees using Stellar **fee-bump transactions**.

In this model:
- The user still authorizes/signs the inner transaction.
- The backend wraps that signed transaction in a fee-bump envelope.
- A dedicated sponsor account signs the fee-bump and pays the transaction fee.

### Proof of Implementation

Implementation evidence in code:
- Fee sponsorship utility:
  - `Backend/src/utils/feeSponsor.js`
  - Uses `TransactionBuilder.buildFeeBumpTransaction(...)`
  - Controls sponsorship with env flags and sponsor key handling
- Horizon payment flow sponsorship:
  - `Backend/src/modules/battles/services/battleEscrow.service.js`
  - Wraps payment tx before `server.submitTransaction(...)`
- Soroban contract flow sponsorship:
  - `Backend/src/modules/battles/services/battleChain.service.js`
  - Wraps prepared/signed contract tx before `rpcServer.sendTransaction(...)`

Configuration proof:
- `Backend/.env.example` includes:
  - `STELLAR_ENABLE_FEE_SPONSORSHIP=true`
  - `STELLAR_FEE_SPONSOR_SECRET=`
  - `STELLAR_FEE_BUMP_BASE_FEE=100`

### Enable in Deployment

Set the following backend environment variables:

```bash
STELLAR_ENABLE_FEE_SPONSORSHIP=true
STELLAR_FEE_SPONSOR_SECRET=<funded sponsor secret key>
STELLAR_FEE_BUMP_BASE_FEE=100
```

When enabled, Roastellar submits fee-bumped transactions for eligible Stellar payment and Soroban contract actions.

## Data Indexing

### Approach Description

Roastellar uses MongoDB indexes focused on read-heavy paths (leaderboard, battle discovery, match lookups, analytics timelines) and integrity-critical paths (duplicate vote/prediction prevention, unique identities).

Key indexes implemented:

- User identity and leaderboard:
  - `clerkId` unique index (auth identity lookup)
  - `email` unique index
  - leaderboard indexes on `xp`, `wins`, `rankPoints`
- Battle performance:
  - `matchId` unique index (fast battle lookup by public match id)
  - `status + createdAt` compound index (open/active battle listing)
  - `player1 + createdAt`, `player2 + createdAt`, `winner + createdAt` compound indexes
- Prediction and vote integrity:
  - `battleId + predictor` unique compound index (one prediction per user per battle)
  - `battleId + voter` unique compound index (one vote per user per battle)
- Analytics timelines:
  - `eventType + timestamp` compound index
  - `userId + timestamp` compound index

This indexing strategy keeps common leaderboard and battle queries efficient while enforcing key anti-duplication rules at the database layer.

### Endpoint / Dashboard Link

- Public metrics endpoint (indexed analytics-backed): [https://roastellar.onrender.com/api/analytics/metrics](https://roastellar.onrender.com/api/analytics/metrics)

## Monitoring Active

Roastellar uses active uptime monitoring on the backend health route to continuously verify service availability and response-time behavior.  
The health endpoint also exposes runtime and dependency readiness signals (MongoDB + Stellar config) for operational visibility.

- Health check endpoint: [https://roastellar.onrender.com/health](https://roastellar.onrender.com/health)
- Screenshot (monitoring dashboard): ![https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777548032/Screenshot_2026-04-30_165012_ziodyh.png](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777548032/Screenshot_2026-04-30_165012_ziodyh.png)

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
STELLAR_CONTRACT_ID=CB2NV4N7NEZFTNRBVZSZDH64RROI7FDPTIFWNXMQOAA5JB2BUWXG4BHW
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

## Community Contribution

**Tweet Link:** [https://x.com/RupamGhosh2006/status/2049507507253768670](https://x.com/RupamGhosh2006/status/2049507507253768670)

**Screenshot:**

![Community Contribution Screenshot](https://res.cloudinary.com/ddp0nf4uv/image/upload/v1777480736/communityContribution_hkhrcz.jpg)


## License

MIT
