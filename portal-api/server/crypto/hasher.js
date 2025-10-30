const crypto = require('crypto');

class Hasher {
  #hashStrategy;

  constructor(hashStrategy) {
    this.#hashStrategy = hashStrategy;
  }

  hash(target) {
    try {
      const salt = this.#hashStrategy.generateSalt();
      const hash = this.#hashStrategy.generateHash(target, salt);

      return {
        hash,
        salt,
      };
    } catch (error) {
      console.error('An error has occurred while computing the hash %o', error);
      return {
        hash: '',
        salt: '',
      };
    }
  }

  verifyHash({ target, salt, hash }) {
    try {
      const targetHash = this.#hashStrategy.generateHash(target, salt);

      return crypto.timingSafeEqual(targetHash, hash);
    } catch (error) {
      console.error('An error has occurred while verifying the hash %o', error);
      return false;
    }
  }
}

module.exports = {
  Hasher,
};
