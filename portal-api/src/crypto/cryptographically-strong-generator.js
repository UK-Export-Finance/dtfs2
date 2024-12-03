const crypto = require('node:crypto');

class CryptographicallyStrongGenerator {
  randomBytes(numberOfBytes) {
    return crypto.randomBytes(numberOfBytes);
  }

  randomHexString(numberOfBytes) {
    return this.randomBytes(numberOfBytes).toString('hex');
  }
}

module.exports = {
  CryptographicallyStrongGenerator,
};
