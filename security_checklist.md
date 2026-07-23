# Roastellar security checklist

This checklist records security controls verified against the current source tree on **23 July 2026**. It is implementation evidence for the production testnet MVP; it is not a substitute for an independent security audit or a mainnet readiness review.

## Scope

- API and Socket.IO backend: `Backend/src/**`
- Web client: `Frontend/src/**`
- Soroban contract: `contracts/roastellar/src/lib.rs`
- Deployment/configuration hygiene: repository `.gitignore` files and environment templates

## Current testnet controls

| Control | Status | Implementation evidence |
|---|---|---|
| Identity authentication | Implemented | Clerk tokens and signed wallet-session tokens are verified by `clerk.middleware.js`. |
| Freighter wallet proof | Implemented | A random challenge nonce, short expiry, public-key validation, and signature verification protect `/api/auth/wallet/challenge` and `/api/auth/wallet/verify`. |
| Authorization | Implemented | Sensitive routes use `protect`; administrative routes additionally use `requireAdmin`. |
| Input validation and sanitisation | Implemented | Zod schemas and shared sanitisation are applied to battle, prediction, profile, and wallet-auth writes. |
| Abuse controls | Implemented | Global API, battle-write, prediction, and avatar-upload rate limiters are present. |
| HTTP edge controls | Implemented | Helmet, configured CORS origins, body-size limits, centralized errors, and proxy trust configuration are active. |
| Live connection authentication | Implemented | Socket.IO verifies Clerk or wallet tokens before users can join lobby/battle rooms. |
| Duplicate battle actions | Implemented | Service checks plus unique MongoDB indexes prevent duplicate votes and predictions. Soroban additionally maintains vote participation state. |
| Protected reports and history | Implemented | Match history and battle reports require authenticated access and restrict access to eligible participants. |
| Avatar upload validation | Implemented | Only PNG, JPEG, and WebP data URLs with verified file signatures and a 5 MB maximum are accepted. |
| Managed wallet encryption | Implemented | Managed wallet secrets are encrypted before MongoDB persistence and require a configured encryption key to decrypt. |
| Secret tracking hygiene | Implemented | `.env` and local environment variants are ignored; no environment file is currently tracked by Git. |
| Monitoring and audit signals | Implemented | Health, aggregate analytics, and security-relevant server logs provide operational visibility. |

## Authentication and authorization

### Clerk sessions

`Backend/src/middlewares/clerk.middleware.js` is the active server-side enforcement point for protected API routes. It reads a bearer token (or `x-clerk-token`), verifies Clerk claims, resolves the associated user, and attaches the identity to `req.auth`.

- Battle writes, wallet operations, profile changes, avatar uploads, prediction placement, and protected reports use `protect`.
- `Backend/src/modules/admin/routes/admin.routes.js` combines `protect` and `requireAdmin` for administrative endpoints.
- Browser-side Clerk routing improves the user experience, but backend route protection is the security boundary.

### Freighter wallet sessions

The wallet-auth flow verifies possession of the address rather than trusting a client-submitted public key:

1. `/api/auth/wallet/challenge` validates the Stellar public key, creates a cryptographically random nonce, and sets a five-minute expiry.
2. The wallet signs the challenge through Freighter-compatible signing.
3. `/api/auth/wallet/verify` checks the signature against the supplied public key, rejects expired or mismatched nonces, clears the nonce after use, and issues a signed wallet session token.
4. Wallet lookup checks `walletPublicKey` and `identityWalletAddress` before using a legacy `wallet:<address>` identity. This prevents a future Freighter sign-in from creating a duplicate account for a Google-managed wallet.

Socket.IO applies the same Clerk-or-wallet-token verification before admitting a connection.

## Request and data protection

### Validation, sanitisation, and uploads

- `Backend/src/modules/battles/routes/battle.routes.js` applies Zod validation, size limits, and sanitisation to topic, roast, and vote input.
- `Backend/src/modules/predictions/routes/prediction.routes.js` validates and sanitises prediction input.
- `Backend/src/modules/users/routes/user.routes.js` validates profile edits and applies a dedicated avatar-upload limiter.
- `Backend/src/utils/inputSanitizer.js` removes control characters, enforces length bounds, and constrains usernames, CIDs, and wallet address input.
- `Backend/src/modules/users/controllers/user.controller.js` validates image MIME type, base64 form, file signature, and a 5 MB maximum before Pinata upload.

### HTTP and real-time boundaries

- `Backend/src/app.js` uses Helmet, origin allow-list CORS, a 10 MB JSON/body limit, a configurable global API limiter, and centralized 404/error middleware.
- `Backend/src/config/socket.js` applies the same origin allow-list to Socket.IO and rejects unauthenticated sockets.
- Write-heavy battle and prediction routes have stricter endpoint-level limiters than the general API limit.

### Duplicate and replay resistance

- `BattleVote` enforces unique `{ battleId, voter }` records.
- `Prediction` enforces unique `{ battleId, predictor }` records.
- Battle services check existing records before persistence; the database index remains the final concurrency guard.
- The Soroban contract records `HasVoted` state by wallet and match ID.
- Wallet authentication nonces expire and are cleared after a successful verification.

## Wallet and Stellar controls

### Managed wallet secrets

Managed wallet private keys are encrypted with `WALLET_ENCRYPTION_KEY` (or the configured encryption key alias) before being stored as `walletEncryptedSecret`. `Backend/src/modules/wallet/wallet.service.js` refuses to encrypt or decrypt if no key is configured.

- Decryption occurs only in backend flows that must execute a managed-wallet action, such as escrow handling.
- Wallet public addresses are returned by normal wallet APIs; private keys are not included in standard wallet responses.
- Testnet-only secret export for Freighter import is explicitly disabled when `STELLAR_NETWORK=mainnet`, and the event is logged.

### Chain action integrity

- Contract functions require authorization from the relevant Stellar address.
- Contract state records joins, votes, and predictions per match.
- API reports retain stored transaction hashes so users can inspect available transactions with Stellar Expert.

## Secrets and configuration

Production secrets must be supplied through the deployment platform's environment configuration and must never be copied into source files, screenshots, issue comments, or the README.

| Secret/configuration | Required production treatment |
|---|---|
| `CLERK_SECRET_KEY`, `CLERK_JWT_KEY`, `CLERK_WEBHOOK_SECRET` | Keep server-only; configure authorized parties/origins for the real frontend domain. |
| `MONGODB_URI` | Store only in the backend environment; use a least-privilege database user and network restrictions. |
| `WALLET_ENCRYPTION_KEY` | Use a unique high-entropy production value; rotate through a controlled key-migration plan. |
| `STELLAR_*_SECRET`, `TREASURY_SECRET` | Store only in the backend deployment environment; never expose to the browser or commit. |
| `PINATA_JWT` | Keep backend-only and limit the token's Pinata permissions where possible. |
| `CLIENT_URL` / `CLIENT_ORIGINS` | Set exact production origins rather than broad wildcards. |

The repository ignores `.env`, `.env.local`, `.env.*.local`, `*.pem`, `secret.txt`, and build artifacts. Environment templates are documentation only and must be replaced with deployment-specific values.

## Mainnet release gates

These items are deliberately not marked complete. They are required before moving from the current testnet MVP to a production mainnet custody/payment environment.

| Gate | Required action |
|---|---|
| Independent review | Perform a smart-contract and backend security audit, then remediate findings before handling mainnet value. |
| Wallet custody model | Reassess managed-wallet custody; use a dedicated key-management solution and document recovery, rotation, and incident procedures. |
| Encryption fallback removal | Remove or fail closed on every legacy/default encryption-key fallback, including older service paths, before mainnet deployment. |
| Secret export | Keep secret export permanently disabled on mainnet and require a deliberate, audited recovery process instead. |
| Distributed rate limiting | Use a shared backing store for rate limits if the backend is deployed with multiple replicas. |
| Network and CSP review | Lock CORS/Clerk origins to exact domains and review a strict Content Security Policy for all third-party assets. |
| Security regression tests | Add automated tests for unauthorized access, invalid/expired wallet signatures, duplicate actions, report access, upload rejection, and rate-limit behavior. |
| Monitoring and response | Add alerting, log retention, dependency/secret rotation schedules, and a documented incident-response runbook. |

## Verification commands

Run these from the repository root before a release:

```powershell
git ls-files | rg "(^|/)\.env($|\.)"
git diff --check
```

Expected result: no tracked environment files and no whitespace errors. Continue with the normal frontend build, backend checks, contract tests, and a testnet smoke test.

## Final status

**Testnet MVP:** the controls in the current-testnet table are implemented in source and documented above.

**Mainnet:** not approved by this checklist alone; complete every mainnet release gate and obtain an independent review first.

## Related documentation

- [Production architecture](./ARCHITECTURE.md)
- [README](./README.md)
