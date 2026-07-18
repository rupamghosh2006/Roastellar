const { StellarSdk, rpcServer, NETWORK_PASSPHRASE } = require('../../../config/stellar');
const logger = require('../../../utils/logger');
const { shouldSponsor, buildFeeBumpTx } = require('../../../utils/feeSponsor');

const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID || 'CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA';
const ESCROW_SECRET = process.env.STELLAR_ESCROW_SECRET || process.env.STELLAR_BATTLE_SECRET || process.env.TREASURY_SECRET || '';
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
  if (!returnValue) return { ok: true, value: null };
  try {
    let scVal = returnValue;
    if (typeof returnValue === 'string') {
      try {
        scVal = StellarSdk.xdr.ScVal.fromXDR(returnValue, 'base64');
      } catch (e) {
        logger.warn('parseReturnValue fromXDR failed, trying native', { message: e?.message });
      }
    }
    if (typeof StellarSdk.scValToNative === 'function') {
      let native;
      try {
        native = StellarSdk.scValToNative(scVal);
      } catch (e) {
        logger.warn('parseReturnValue scValToNative failed', { message: e?.message });
        return { ok: true, value: null };
      }
      if (native === undefined || native === null) {
        return { ok: true, value: null };
      }
      if (typeof native === 'object' && 'switch' in native) {
        if (native.switch === 0 && native.value !== undefined) {
          return { ok: true, value: native.value };
        }
        if (native.switch === 1) {
          logger.error('Contract returned Err variant', { returnValue: JSON.stringify(native) });
          return { ok: false, value: native.value };
        }
      }
      return { ok: true, value: native };
    }
    return { ok: true, value: null };
  } catch (e) {
    logger.error('parseReturnValue failed', { message: e?.message, returnValue });
    return { ok: true, value: null };
  }
}

class BattleChainService {
  getEscrowSecret() {
    if (!ESCROW_SECRET) {
      throw new Error('STELLAR_ESCROW_SECRET (or STELLAR_BATTLE_SECRET or TREASURY_SECRET) is required');
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
    logger.info('Soroban simulate result', { method, simulated: JSON.stringify(simulated, null, 2) });
    let simulatedReturnValue = null;
    if (simulated?.result?.retval) {
      simulatedReturnValue = parseReturnValue(simulated?.result?.retval);
    } else if (simulated?.retval) {
      simulatedReturnValue = parseReturnValue(simulated?.retval);
    } else if (simulated?.result?.result?.retval) {
      simulatedReturnValue = parseReturnValue(simulated?.result?.result?.retval);
    }
    logger.info('Parsed simulated return value', { method, simulatedReturnValue });
    if (simulatedReturnValue && !simulatedReturnValue.ok) {
      throw new Error(`Contract error: ${JSON.stringify(simulatedReturnValue.value)}`);
    }

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

    const submitTx = shouldSponsor(accountPublic) ? buildFeeBumpTx(signedTx) : signedTx;
    const sent = await rpcServer.sendTransaction(submitTx);
    if (sent.status === 'ERROR') {
      throw new Error(`Soroban send failed: ${sent.errorResultXdr || 'unknown error'}`);
    }

    const hash = sent.hash;
    const maxAttempts = Number(process.env.STELLAR_TX_POLL_ATTEMPTS || 25);
    const pollIntervalMs = Number(process.env.STELLAR_TX_POLL_INTERVAL_MS || 1200);

    let lastError = null;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      let txResult = null;
      try {
        txResult = await rpcServer.getTransaction(hash);
        lastError = null;
      } catch (error) {
        lastError = error;
        logger.warn('Soroban getTransaction decode failed (will retry)', {
          method,
          txHash: hash,
          attempt: attempt + 1,
          message: error?.message,
        });
        await sleep(pollIntervalMs);
        continue;
      }
      if (txResult?.status === 'SUCCESS') {
        logger.info('Soroban tx result', { method, txResult: JSON.stringify(txResult, null, 2) });
        const parsedReturnValue = parseReturnValue(txResult.returnValue);
        if (!parsedReturnValue.ok) {
          throw new Error(`Contract error: ${JSON.stringify(parsedReturnValue.value)}`);
        }
        logger.info('Parsed tx return value', { method, parsed: parsedReturnValue.value });
        return {
          txHash: hash,
          returnValue: parsedReturnValue.value,
          raw: txResult,
        };
      }
      if (txResult?.status === 'FAILED') {
        throw new Error(`Soroban tx failed: ${hash}`);
      }
      await sleep(pollIntervalMs);
    }

    if (lastError) {
      throw lastError;
    }
    // Never persist an off-chain state change based on simulation alone. The
    // caller updates MongoDB only after this method confirms SUCCESS, so a
    // polling timeout must remain an error rather than creating a false mirror.
    throw new Error(`Soroban tx polling timed out: ${hash}`);
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
