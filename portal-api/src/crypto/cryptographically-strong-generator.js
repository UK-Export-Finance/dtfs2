const crypto = require('node:crypto');

class CryptographicallyStrongGenerator {
  randomBytes(numberOfBytes) {
    return crypto.randomBytes(numberOfBytes);
  }

  randomHexString(numberOfBytes) {
    return this.randomBytes(numberOfBytes).toString('hex');
  }

  validateHexString({ numberOfBytes, inputString }) {
    const lengthOfHexString = numberOfBytes * 2;
    const hexStringOfLengthRegex = new RegExp(`^[0-9a-fA-F]{${lengthOfHexString}}$`);
    return hexStringOfLengthRegex.test(inputString);
  }
}

module.exports = {
  CryptographicallyStrongGenerator,
};
