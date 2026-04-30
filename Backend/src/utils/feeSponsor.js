const { StellarSdk, NETWORK_PASSPHRASE } = require('../config/stellar');

function getSponsorKeypair() {
  const sponsorSecret = process.env.STELLAR_FEE_SPONSOR_SECRET || '';
  if (!sponsorSecret) return null;
  try {
    return StellarSdk.Keypair.fromSecret(sponsorSecret);
  } catch (_) {
    return null;
  }
}

function getFeeBumpBaseFee() {
  return String(process.env.STELLAR_FEE_BUMP_BASE_FEE || StellarSdk.BASE_FEE || 100);
}

function shouldSponsor(sourcePublicKey = '') {
  if (String(process.env.STELLAR_ENABLE_FEE_SPONSORSHIP || 'true').toLowerCase() === 'false') {
    return false;
  }
  const sponsor = getSponsorKeypair();
  if (!sponsor) return false;
  return sponsor.publicKey() !== String(sourcePublicKey || '');
}

function buildFeeBumpTx(innerTx) {
  const sponsor = getSponsorKeypair();
  if (!sponsor) return innerTx;
  const feeBump = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
    sponsor,
    getFeeBumpBaseFee(),
    innerTx,
    NETWORK_PASSPHRASE
  );
  feeBump.sign(sponsor);
  return feeBump;
}

module.exports = {
  getSponsorKeypair,
  getFeeBumpBaseFee,
  shouldSponsor,
  buildFeeBumpTx,
};

