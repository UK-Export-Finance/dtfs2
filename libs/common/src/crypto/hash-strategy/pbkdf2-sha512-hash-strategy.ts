import { HashStrategy } from '../../types/hash-strategy';
import byteGenerator from '../byte-generator';
import crypto from 'node:crypto';

const pbkdf2Sha512HashStrategy: HashStrategy = {
  generateSalt: () => byteGenerator.randomBytes(64),
  generateHash: (target: string, salt: Buffer): Buffer => {
    return crypto.pbkdf2Sync(target, salt, 210000, 64, 'sha512');
  },
};

export default pbkdf2Sha512HashStrategy;
