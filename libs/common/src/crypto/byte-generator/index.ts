import { cryptoConfig } from '../../config/crypto.config';
import { ByteGenerator } from '../../types/byte-generator';
import cryptographicallyStrongGenerator from './cryptographically-strong-byte-generator';

const getByteGenerator = (): ByteGenerator => {
  switch (cryptoConfig.byteGeneratorProvider) {
    case 'cryptographically-strong':
      return cryptographicallyStrongGenerator;
    default:
      throw new Error('Unsupported byte generator provider');
  }
};

const byteGenerator = getByteGenerator();

export default byteGenerator;
