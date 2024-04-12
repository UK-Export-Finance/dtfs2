import crypto from 'node:crypto';
import { ByteGenerator } from '../../types/byte-generator';

const randomBytes = (numberOfBytes: number): Buffer => {
  return crypto.randomBytes(numberOfBytes);
};

const cryptographicallyStrongGenerator: ByteGenerator = {
  randomBytes,
  randomHexString: (numberOfBytes: number) => {
    return randomBytes(numberOfBytes).toString('hex');
  },
};

export default cryptographicallyStrongGenerator;
