class Hasher {
  #hashStrategy;

  constructor(hashStrategy) {
    this.#hashStrategy = hashStrategy;
  }

  hash(target) {
    const salt = this.#hashStrategy.generateSalt();
    const hash = this.#hashStrategy.generateHash(target, salt);
    return {
      hash,
      salt,
    };
  }

  verifyHash({ target, salt, hash }) {
    const targetHash = this.#hashStrategy.generateHash(target, salt);
    return targetHash === hash;
  }
}

module.exports = {
  Hasher,
};
