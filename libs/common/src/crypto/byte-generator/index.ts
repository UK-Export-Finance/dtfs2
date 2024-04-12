import { cryptoConfig } from '../../config/crypto.config';
import { ByteGenerator } from '../../types/byte-generator';
import cryptographicallyStrongGenerator from './cryptographically-strong-byte-generator';

const getByteGenerator = (): ByteGenerator => {
  switch (cryptoConfig.BYTE_GENERATOR_PROVIDER) {
    case 'cryptographically-strong':
      return cryptographicallyStrongGenerator;
    default:
      throw new Error(`Unsupported byte generator provider: ${cryptoConfig.BYTE_GENERATOR_PROVIDER}`);
  }
};

const byteGenerator = getByteGenerator();

export default byteGenerator;
