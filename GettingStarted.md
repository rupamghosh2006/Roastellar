# Getting started with Roastellar

This guide starts the Roastellar testnet stack locally, explains the required environment variables, and documents the current CI/CD and Soroban deployment path.

## Prerequisites

- Node.js **20** and npm (the CI workflows use Node 20)
- A MongoDB connection string
- A Clerk development instance
- A Pinata JWT if you need IPFS roast storage or profile-image uploads
- Rust and the `wasm32v1-none` target
- Stellar CLI. Follow the [official Stellar testnet deployment guide](https://developers.stellar.org/docs/build/smart-contracts/getting-started/deploy-to-testnet).

## 1. Install dependencies

From the repository root:

```powershell
cd Backend
npm ci

cd ..\Frontend
npm ci
```

## 2. Configure local environment variables

Create local environment files. Never commit them.

```powershell
cd ..\Backend
Copy-Item .env.example .env

cd ..\Frontend
Copy-Item .env.example .env.local
```

### Backend: `Backend/.env`

For local development, use port `3001` for the backend so the Next.js frontend can use port `3000`.

```dotenv
PORT=3001
NODE_ENV=development
ALLOW_DEV_AUTH_FALLBACK=false

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/roastellar

CLERK_SECRET_KEY=sk_test_<your_clerk_secret>
CLERK_JWT_KEY=<your_clerk_jwt_key>
CLERK_WEBHOOK_SECRET=whsec_<your_webhook_secret>
CLERK_AUTHORIZED_PARTIES=http://localhost:3000

CLIENT_URL=http://localhost:3000
CLIENT_ORIGINS=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

WALLET_ENCRYPTION_KEY=<unique_high_entropy_development_key>

STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_CONTRACT_ID=CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA

PINATA_JWT=<pinata_jwt_for_ipfs_and_avatar_uploads>

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

To exercise on-chain battle creation, escrow, and fee-sponsorship flows, configure the additional Stellar secrets from `Backend/.env.example` in the **backend environment only**:

```dotenv
STELLAR_BATTLE_SECRET=<testnet_signing_secret>
STELLAR_BATTLE_PUBLIC=<matching_public_key>
STELLAR_ESCROW_SECRET=<testnet_escrow_secret>
STELLAR_ESCROW_PUBLIC=<matching_public_key>
TREASURY_SECRET=<testnet_treasury_secret>
STELLAR_ENABLE_FEE_SPONSORSHIP=true
STELLAR_FEE_SPONSOR_SECRET=<optional_testnet_fee_sponsor_secret>
```

Do not use a sample encryption value from an environment template. Use a unique, high-entropy value in every deployed environment. Never place any Stellar secret, Clerk secret, MongoDB URI, or Pinata JWT in `NEXT_PUBLIC_*` variables.

### Frontend: `Frontend/.env.local`

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<your_clerk_publishable_key>
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 3. Run locally

Start the backend in one terminal:

```powershell
cd Backend
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd Frontend
npm run dev
```

Open `http://localhost:3000`. The backend health endpoint returns `status: "ok"` once MongoDB is connected:

```powershell
Invoke-RestMethod http://localhost:3001/health
```

Before opening a pull request, run the primary checks used by CI:

```powershell
cd Backend
Get-ChildItem -Path src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }

cd ..\Frontend
npm run build
```

## 4. Contract build and testnet deployment

The repository already has a deployed testnet contract:

- **Contract ID:** [`CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA`](https://stellar.expert/explorer/testnet/contract/CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA)

Set that value as `STELLAR_CONTRACT_ID` to use the existing deployment. Deploy a new instance only when you intentionally need new contract state or a new WASM version.

### Build the WASM

```powershell
cd contracts\roastellar
rustup target add wasm32v1-none
cargo build --target wasm32v1-none --release
cargo test
```

The compiled contract is written to:

```text
contracts/roastellar/target/wasm32v1-none/release/roastellar.wasm
```

### Create and fund a testnet deployer

Use a dedicated testnet identity. Do not reuse a production or personal mainnet secret.

```powershell
stellar keys generate roastellar-deployer --network testnet --fund
stellar keys address roastellar-deployer
```

### Deploy a fresh testnet instance

Run this command from `contracts/roastellar`:

```powershell
stellar contract deploy `
  --wasm target/wasm32v1-none/release/roastellar.wasm `
  --source-account roastellar-deployer `
  --network testnet `
  --alias roastellar
```

The command returns a contract ID beginning with `C`. Update `STELLAR_CONTRACT_ID` in the backend deployment environment with that returned ID, redeploy the backend, and record the contract address in the README.

### Verify the deployed contract

The CLI requires `--` before the contract method and its arguments:

```powershell
stellar contract invoke `
  --id roastellar `
  --source-account roastellar-deployer `
  --network testnet `
  -- `
  get_match `
  --match_id 1
```

Read-only invocations are simulated locally by the CLI. State-changing invocations may require the CLI's `--send=yes` confirmation behaviour. See the [official Stellar testnet deployment guide](https://developers.stellar.org/docs/build/smart-contracts/getting-started/deploy-to-testnet) for current CLI behaviour.

## 5. CI/CD setup

GitHub Actions runs three workflows:

| Workflow | CI checks | Production deployment trigger |
|---|---|---|
| `.github/workflows/contracts-ci.yml` | Installs Rust, builds the WASM, and runs contract tests. | No deployment. |
| `.github/workflows/backend-ci-cd.yml` | Runs `npm ci` and JavaScript syntax checks in `Backend`. | Push to `master` after CI succeeds. |
| `.github/workflows/frontend-ci-cd.yml` | Runs `npm ci` and `npm run build` in `Frontend`. | Push to `master` after CI succeeds. |

### GitHub Actions secrets

Add these repository secrets in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Used by | Purpose |
|---|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Backend workflow | Render deploy hook called after a successful `master` build. |
| `VERCEL_TOKEN` | Frontend workflow | Authenticates Vercel CLI pull, build, and deploy commands. |

The frontend workflow defines the Vercel scope and project in the workflow file. Keep those values aligned with the Vercel project that uses `Frontend` as its root directory.

### Render backend

1. Create or connect the Render web service from `render.yaml`.
2. Ensure the service root directory is `Backend`, the build command is `npm ci`, and the start command is `npm start`.
3. Add every required backend environment variable in Render, especially MongoDB, Clerk, `WALLET_ENCRYPTION_KEY`, Stellar testnet configuration, Pinata, and exact frontend origins.
4. Configure `/health` as the health-check path.
5. Copy the service deploy hook URL to the `RENDER_DEPLOY_HOOK_URL` GitHub secret.

### Vercel frontend

1. Import the repository into Vercel with `Frontend` as the root directory.
2. Vercel uses `Frontend/vercel.json`, `npm ci`, and `npm run build`.
3. Configure these production variables in Vercel:

   ```dotenv
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_<or_test_key>
   NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://<your-render-backend>.onrender.com
   ```

4. Create a Vercel token and store it as the `VERCEL_TOKEN` GitHub secret.

## Deployment checklist

- [ ] Backend `/health` reports MongoDB as connected and Stellar configuration as ready.
- [ ] `CLIENT_URL`, `CLIENT_ORIGINS`, and Clerk authorized parties match the deployed frontend URL exactly.
- [ ] Frontend public API/socket URLs point to the deployed backend over HTTPS.
- [ ] Testnet secrets are configured only in Render; no secret is exposed to Vercel public variables.
- [ ] `STELLAR_CONTRACT_ID` matches the intended testnet contract deployment.
- [ ] GitHub Actions builds pass before merging or pushing to `master`.

## Related documentation

- [Architecture](./ARCHITECTURE.md)
- [Security checklist](./security_checklist.md)
- [README](./README.md)
