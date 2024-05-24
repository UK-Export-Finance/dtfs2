declare class CryptographicallyStrongGenerator {
  randomBytes(numberOfBytes: number): Buffer;
  randomHexString(numberOfBytes: number): string;
}

export = CryptographicallyStrongGenerator;
