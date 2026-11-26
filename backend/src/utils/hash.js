const crypto = require('crypto');

function hashPassword(password) {
  const md5Hex = crypto.createHash('md5').update(String(password), 'utf8').digest('hex');
  const sha1Hex = crypto.createHash('sha1').update(md5Hex, 'utf8').digest('hex');
  const sha1Binary = Buffer.from(sha1Hex, 'hex');
  const finalHash = crypto.createHash('sha1').update(sha1Binary).digest('hex');
  return `*${finalHash.toUpperCase()}`;
}

module.exports = { hashPassword };
