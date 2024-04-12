import { Hasher } from '../types/hasher';
import hashStrategy from './hash-strategy';
import crypto from 'node:crypto';

const hasher: Hasher = {
  hash: (target: string) => {
    const salt = hashStrategy.generateSalt();
    const hash = hashStrategy.generateHash(target, salt);

    return {
      hash,
      salt,
    };
  },
  verify: (target: string, salt: string, hash: Buffer) => {
    const targetHash = hashStrategy.generateHash(target, Buffer.from(salt, 'base64'));

    return crypto.timingSafeEqual(targetHash, hash);
  },
};

export default hasher;
