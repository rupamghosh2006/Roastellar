function sanitizeText(value, max = 280) {
  const text = String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, max);
}

function sanitizeUsername(value) {
  const text = sanitizeText(value, 20).replace(/[^a-zA-Z0-9_]/g, '');
  return text;
}

function sanitizeCid(value, max = 120) {
  return sanitizeText(value, max).replace(/[^a-zA-Z0-9._:/-]/g, '');
}

function sanitizeWalletAddress(value) {
  return sanitizeText(value, 80).replace(/\s+/g, '');
}

module.exports = {
  sanitizeText,
  sanitizeUsername,
  sanitizeCid,
  sanitizeWalletAddress,
};

