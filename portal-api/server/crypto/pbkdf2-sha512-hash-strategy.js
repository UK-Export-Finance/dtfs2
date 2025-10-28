const { hash } = require('@ukef/dtfs2-common');

class Pbkdf2Sha512HashStrategy {
  #byteGenerator;

  constructor(byteGenerator) {
    this.#byteGenerator = byteGenerator;
  }

  generateSalt() {
    return this.#byteGenerator.randomBytes();
  }

  generateHash(password, salt) {
    const passwordString = password.toString('hex');
    const saltString = salt.toString('hex');

    return hash(passwordString, saltString);
  }
}

module.exports = {
  Pbkdf2Sha512HashStrategy,
};
