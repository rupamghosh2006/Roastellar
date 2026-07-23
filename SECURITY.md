# Security Policy

## Project status

Roastellar is currently a **testnet MVP**. It is not approved for mainnet funds or production custody.

## Supported versions

Security fixes are provided only for the latest code on `master` and the current deployed testnet services. Older commits and forks are unsupported.

## Reporting a vulnerability

Please use GitHub’s **Report a vulnerability** feature to submit reports privately. Do not open a public issue or disclose exploit details publicly before a fix is available.

Include:
- affected component and file/endpoint
- reproduction steps or proof of concept
- potential impact
- suggested mitigation, if known

We aim to acknowledge reports within 3 business days and provide a triage/update within 7 business days.

## Scope

In scope:
- frontend and backend code in this repository
- authentication, wallet-session, authorization, upload, API, and Socket.IO flows
- Soroban contract code and testnet deployment configuration
- accidental exposure of repository or deployment secrets

Out of scope:
- social engineering, phishing, or denial-of-service testing
- issues requiring access to someone else’s account or wallet
- vulnerabilities only in third-party hosted services, unless caused by Roastellar configuration
- testnet-only issues with no realistic security impact

## Safe testing

Do not access other users’ data, disrupt services, move funds, or publish private information. Test only with accounts and wallets you control.

## Disclosure

We will coordinate disclosure after a fix or mitigation is available. There is currently no bug-bounty program.
