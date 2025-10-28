const { hash } = require('@ukef/dtfs2-common');

class Pbkdf2Sha512HashStrategy {
  #byteGenerator;

  constructor(byteGenerator) {
    this.#byteGenerator = byteGenerator;
  }

  generateSalt() {
    return this.#byteGenerator.randomBytes();
  }

  generateHash(target, salt) {
    return hash(target, salt);
  }
}

module.exports = {
  Pbkdf2Sha512HashStrategy,
};
