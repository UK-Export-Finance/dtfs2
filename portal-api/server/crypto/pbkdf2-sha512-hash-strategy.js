const crypto = require('node:crypto');

class Pbkdf2Sha512HashStrategy {
  #byteGenerator;

  constructor(byteGenerator) {
    this.#byteGenerator = byteGenerator;
  }

  generateSalt() {
    return this.#byteGenerator.randomBytes(64);
  }

  generateHash(target, salt) {
    return crypto.pbkdf2Sync(target, salt, 210000, 64, 'sha512');
  }
}

module.exports = {
  Pbkdf2Sha512HashStrategy,
};
