require('dotenv').config();
const StellarSdk = require('stellar-sdk');

const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK === 'mainnet'
  ? 'Public Global Stellar Network ; September 2015'
  : 'Test SDF Network ; September 2015';

const HORIZON_URL = process.env.STELLAR_NETWORK === 'mainnet'
  ? 'https://horizon.stellar.org'
  : 'https://horizon-testnet.stellar.org';

const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';

const server = new StellarSdk.Horizon.Server(HORIZON_URL, {
  allowHttp: true,
});

const rpcServer = new StellarSdk.SorobanRpc.Server(RPC_URL, {
  allowHttp: true,
});

const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID;

module.exports = {
  StellarSdk,
  server,
  rpcServer,
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  HORIZON_URL,
  RPC_URL,
};
