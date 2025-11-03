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
    try {
      const passwordString = password.toString('hex');
      const saltString = salt.toString('hex');

      return hash(passwordString, saltString);
    } catch (error) {
      console.error('An error has occurred while generating the hash %o', error);
      return false;
    }
  }
}

module.exports = {
  Pbkdf2Sha512HashStrategy,
};
