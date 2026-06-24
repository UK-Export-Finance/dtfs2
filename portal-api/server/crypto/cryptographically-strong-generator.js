const { salt } = require('@ukef/dtfs2-common');

/**
 * A class for generating cryptographically strong random values.
 *
 * @class
 */
class CryptographicallyStrongGenerator {
  randomBytes() {
    return salt();
  }

  randomHexString() {
    return this.randomBytes().toString('hex');
  }
}

module.exports = {
  CryptographicallyStrongGenerator,
};
