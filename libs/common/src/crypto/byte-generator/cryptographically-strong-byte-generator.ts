import { ByteGenerator } from "../../types/byte-generator";
import crypto from 'node:crypto';

const randomBytes = (numberOfBytes: number): Buffer => {
  return crypto.randomBytes(numberOfBytes);
}

 const cryptographicallyStrongGenerator: ByteGenerator={
  randomBytes,
  randomHexString: (numberOfBytes: number) => {
    return randomBytes(numberOfBytes).toString('hex');
  }
}

export default cryptographicallyStrongGenerator;