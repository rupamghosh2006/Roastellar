const { StellarSdk, rpcServer, NETWORK_PASSPHRASE } = require('../../../config/stellar');
const logger = require('../../../utils/logger');

const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID || 'CAD2N32J72CAIN5E7OSI3FKTRI6UEHUCF6HCHSAYDAKZK2ZPTR5A77ZJ';
const ESCROW_SECRET = process.env.STELLAR_ESCROW_SECRET || process.env.TREASURY_SECRET || '';
const ESCROW_PUBLIC = process.env.STELLAR_ESCROW_PUBLIC || '';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolvePublicKey(secret, fallback = '') {
  if (!secret) return fallback;
  try {
    return StellarSdk.Keypair.fromSecret(secret).publicKey();
  } catch (_) {
    return fallback;
  }
}

function parseReturnValue(returnValue) {
  if (!returnValue) return null;
  try {
    if (typeof returnValue === 'string' && StellarSdk?.xdr?.ScVal?.fromXDR) {
      const scVal = StellarSdk.xdr.ScVal.fromXDR(returnValue, 'base64');
      if (typeof StellarSdk.scValToNative === 'function') {
        return StellarSdk.scValToNative(scVal);
      }
      return scVal;
    }
    if (typeof StellarSdk.scValToNative === 'function') {
      return StellarSdk.scValToNative(returnValue);
    }
  } catch (_) {}
  return null;
}

class BattleChainService {
  getEscrowSecret() {
    if (!ESCROW_SECRET) {
      throw new Error('STELLAR_ESCROW_SECRET (or TREASURY_SECRET) is required');
    }
    return ESCROW_SECRET;
  }

  getEscrowPublic() {
    return ESCROW_PUBLIC || resolvePublicKey(this.getEscrowSecret(), '');
  }

  async invokeContract({ method, args = [], sourceSecret, sourcePublic }) {
    if (!sourceSecret) {
      throw new Error(`Missing source secret for ${method}`);
    }

    const keypair = StellarSdk.Keypair.fromSecret(sourceSecret);
    const accountPublic = sourcePublic || keypair.publicKey();
    const account = await rpcServer.getAccount(accountPublic);

    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: String(StellarSdk.BASE_FEE || 100),
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(60)
      .build();

    const simulated = await rpcServer.simulateTransaction(tx);
    if (simulated?.error) {
      throw new Error(`Soroban simulate failed: ${simulated.error}`);
    }
    const simulatedReturnValue =
      parseReturnValue(simulated?.result?.retval) ??
      parseReturnValue(simulated?.retval) ??
      parseReturnValue(simulated?.result?.result?.retval);

    const assemble =
      StellarSdk?.SorobanRpc?.assembleTransaction ||
      StellarSdk?.rpc?.assembleTransaction ||
      StellarSdk?.assembleTransaction;

    if (typeof assemble !== 'function') {
      throw new Error('No compatible Soroban assembleTransaction function found in stellar-sdk');
    }

    const prepared = assemble(tx, simulated, NETWORK_PASSPHRASE);

    let signedTx = null;
    if (prepared && typeof prepared.sign === 'function') {
      prepared.sign(keypair);
      signedTx = prepared;
    } else if (prepared && typeof prepared.build === 'function') {
      const built = prepared.build();
      built.sign(keypair);
      signedTx = built;
    } else {
      throw new Error('Prepared Soroban transaction has unsupported shape');
    }

    const sent = await rpcServer.sendTransaction(signedTx);
    if (sent.status === 'ERROR') {
      throw new Error(`Soroban send failed: ${sent.errorResultXdr || 'unknown error'}`);
    }

    const hash = sent.hash;
    const maxAttempts = Number(process.env.STELLAR_TX_POLL_ATTEMPTS || 25);
    const pollIntervalMs = Number(process.env.STELLAR_TX_POLL_INTERVAL_MS || 1200);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let txResult = null;
      try {
        txResult = await rpcServer.getTransaction(hash);
      } catch (error) {
        logger.warn('Soroban getTransaction decode failed, using fallback return value', {
          method,
          txHash: hash,
          message: error?.message,
        });
        return {
          txHash: hash,
          returnValue: simulatedReturnValue,
          raw: null,
        };
      }
      if (txResult?.status === 'SUCCESS') {
        return {
          txHash: hash,
          returnValue: parseReturnValue(txResult.returnValue) ?? simulatedReturnValue,
          raw: txResult,
        };
      }
      if (txResult?.status === 'FAILED') {
        throw new Error(`Soroban tx failed: ${hash}`);
      }
      await sleep(pollIntervalMs);
    }

    return { txHash: hash, returnValue: simulatedReturnValue, raw: null };
  }

  async createMatchOnChain({ entryFee, topicCid, sourceSecret, sourcePublic }) {
    logger.info('createMatchOnChain', { contractId: CONTRACT_ID, sourcePublic, entryFee });
    const userAddress = sourcePublic || resolvePublicKey(sourceSecret, '');
    const result = await this.invokeContract({
      method: process.env.STELLAR_CREATE_MATCH_FN || 'create_match',
      args: [
        StellarSdk.nativeToScVal(Number(entryFee || 0), { type: 'i128' }),
        StellarSdk.nativeToScVal(topicCid || '', { type: 'string' }),
        StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
      ],
      sourceSecret,
      sourcePublic: userAddress,
    });

    const onChainMatchId = Number(result.returnValue);
    if (!Number.isFinite(onChainMatchId) || onChainMatchId <= 0) {
      throw new Error('Unable to parse on-chain match id from create_match response');
    }

    return {
      txHash: result.txHash,
      onChainMatchId,
    };
  }

  async joinMatchOnChain({ onChainMatchId, playerPublic, sourceSecret }) {
    const result = await this.invokeContract({
      method: process.env.STELLAR_JOIN_MATCH_FN || 'join_match',
      args: [
        StellarSdk.nativeToScVal(Number(onChainMatchId), { type: 'u32' }),
        StellarSdk.nativeToScVal(playerPublic, { type: 'address' }),
      ],
      sourceSecret,
      sourcePublic: playerPublic,
    });
    return result.txHash;
  }

  async submitRoastOnChain({ onChainMatchId, roastCid, playerPublic, sourceSecret }) {
    const result = await this.invokeContract({
      method: process.env.STELLAR_SUBMIT_ROAST_FN || 'submit_roast',
      args: [
        StellarSdk.nativeToScVal(Number(onChainMatchId), { type: 'u32' }),
        StellarSdk.nativeToScVal(roastCid || '', { type: 'string' }),
        StellarSdk.nativeToScVal(playerPublic, { type: 'address' }),
      ],
      sourceSecret,
      sourcePublic: playerPublic,
    });
    return result.txHash;
  }

  async voteOnChain({ onChainMatchId, selectedPlayerPublic, voterPublic, sourceSecret }) {
    const result = await this.invokeContract({
      method: process.env.STELLAR_VOTE_FN || 'vote',
      args: [
        StellarSdk.nativeToScVal(Number(onChainMatchId), { type: 'u32' }),
        StellarSdk.nativeToScVal(selectedPlayerPublic, { type: 'address' }),
        StellarSdk.nativeToScVal(voterPublic, { type: 'address' }),
      ],
      sourceSecret,
      sourcePublic: voterPublic,
    });
    return result.txHash;
  }

  async predictOnChain({ onChainMatchId, selectedPlayerPublic, amount, predictorPublic, sourceSecret }) {
    const result = await this.invokeContract({
      method: process.env.STELLAR_PREDICT_FN || 'predict',
      args: [
        StellarSdk.nativeToScVal(Number(onChainMatchId), { type: 'u32' }),
        StellarSdk.nativeToScVal(selectedPlayerPublic, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(amount || 0), { type: 'i128' }),
        StellarSdk.nativeToScVal(predictorPublic, { type: 'address' }),
      ],
      sourceSecret,
      sourcePublic: predictorPublic,
    });
    return result.txHash;
  }

  async finalizeMatchOnChain({ onChainMatchId }) {
    const sourceSecret = this.getEscrowSecret();
    const result = await this.invokeContract({
      method: process.env.STELLAR_FINALIZE_MATCH_FN || 'finalize_match',
      args: [StellarSdk.nativeToScVal(Number(onChainMatchId), { type: 'u32' })],
      sourceSecret,
      sourcePublic: this.getEscrowPublic(),
    });
    return result.txHash;
  }

  async refundDrawOnChain({ onChainMatchId }) {
    const sourceSecret = this.getEscrowSecret();
    const result = await this.invokeContract({
      method: process.env.STELLAR_REFUND_DRAW_FN || 'finalize_match',
      args: [StellarSdk.nativeToScVal(Number(onChainMatchId), { type: 'u32' })],
      sourceSecret,
      sourcePublic: this.getEscrowPublic(),
    });
    return result.txHash;
  }
}

module.exports = new BattleChainService();
