import { cryptoConfig } from '../../config/crypto.config';
import { HashStrategy } from '../../types/hash-strategy';
import pbkdf2Sha512HashStrategy from './pbkdf2-sha512-hash-strategy';

const getHashStrategy = (): HashStrategy => {
  switch (cryptoConfig.HASH_STRATEGY_PROVIDER) {
    case 'pbkdf2-sha512':
      return pbkdf2Sha512HashStrategy;
    default:
      throw new Error(`Unsupported hash strategy provider: ${cryptoConfig.HASH_STRATEGY_PROVIDER}`);
  }
};

const hashStrategy = getHashStrategy();

export default hashStrategy;
