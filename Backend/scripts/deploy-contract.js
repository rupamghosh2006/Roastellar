require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const sdk = require('@stellar/stellar-sdk')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const NETWORK = sdk.Networks.TESTNET
const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org'
const rpcServer = new sdk.rpc.Server(RPC_URL)

async function poll(hash, max = 40) {
  for (let i = 0; i < max; i++) {
    const r = await rpcServer.getTransaction(hash)
    if (r.status === 'SUCCESS') return r
    if (r.status === 'FAILED') throw new Error(`tx ${hash} FAILED`)
    await new Promise(r => setTimeout(r, 1500))
  }
  throw new Error(`tx ${hash} timed out`)
}

async function simulateAndSend(ops, kp, pk) {
  const account = await rpcServer.getAccount(pk)
  const tx = new sdk.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK,
  })
  ops.forEach(op => tx.addOperation(op))
  tx.setTimeout(60)
  const built = tx.build()

  const sim = await rpcServer.simulateTransaction(built)
  if (sim.error) throw new Error('Sim: ' + JSON.stringify(sim.error))

  const account2 = await rpcServer.getAccount(pk)
  const tx2 = new sdk.TransactionBuilder(account2, {
    fee: '100',
    networkPassphrase: NETWORK,
  })
  ops.forEach(op => tx2.addOperation(op))
  tx2.setTimeout(60)
  const built2 = tx2.build()

  const prepared = await rpcServer.prepareTransaction(built2, sim, NETWORK)
  prepared.sign(kp)
  const sent = await rpcServer.sendTransaction(prepared)
  if (sent.status === 'ERROR') throw new Error('Send: ' + sent.errorResultXdr)
  return { hash: sent.hash, sim }
}

async function deploy() {
  const secret = process.env.STELLAR_BATTLE_SECRET
  if (!secret) throw new Error('Set STELLAR_BATTLE_SECRET in Backend/.env')
  const kp = sdk.Keypair.fromSecret(secret)
  const pk = kp.publicKey()
  console.log('Deployer:', pk)

  const wasmPath = path.join(__dirname, '..', '..', 'contracts', 'roastellar', 'target', 'wasm32v1-none', 'release', 'roastellar.wasm')
  if (!fs.existsSync(wasmPath)) throw new Error('WASM not found')
  const wasm = fs.readFileSync(wasmPath)
  console.log('WASM:', (wasm.length / 1024).toFixed(1), 'KB')

  // Step 1: Upload WASM
  console.log('\n--- Step 1: Upload WASM ---')
  const { hash: uploadHash } = await simulateAndSend(
    [sdk.Operation.uploadContractWasm({ wasm })], kp, pk
  )
  console.log('Upload tx:', uploadHash)
  const uploadRes = await poll(uploadHash)
  const wasmHash = sdk.scValToNative(uploadRes.returnValue)
  const wasmHashHex = Buffer.from(wasmHash).toString('hex')
  console.log('WASM hash:', wasmHashHex)

  // Step 2: Create contract
  console.log('\n--- Step 2: Create Contract ---')
  const salt = crypto.randomBytes(32)
  const address = new sdk.Address(pk)
  const { hash: createHash } = await simulateAndSend(
    [sdk.Operation.createCustomContract({ wasmHash: Buffer.from(wasmHash), address, salt })], kp, pk
  )
  console.log('Create tx:', createHash)
  const createRes = await poll(createHash)
  const contractId = sdk.scValToNative(createRes.returnValue)

  console.log('\n=== NEW CONTRACT ID ===')
  console.log(contractId)

  console.log('\nSet in Backend/.env as:')
  console.log('STELLAR_CONTRACT_ID=' + contractId)

  return contractId
}

deploy().catch(err => {
  console.error('\nDeploy failed:', err.message)
  process.exit(1)
})
