const { CRYPTO } = require('@ukef/dtfs2-common');
const crypto = require('node:crypto');

class Pbkdf2Sha512HashStrategy {
  #byteGenerator;

  constructor(byteGenerator) {
    this.#byteGenerator = byteGenerator;
  }

  generateSalt() {
    return this.#byteGenerator.randomBytes();
  }

  generateHash(target, salt) {
    return crypto.pbkdf2Sync(target, salt, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM);
  }
}

module.exports = {
  Pbkdf2Sha512HashStrategy,
};
