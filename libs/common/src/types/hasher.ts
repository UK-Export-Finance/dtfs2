export type Hasher = {
  hash: (target: string) => { hash: Buffer; salt: Buffer };
  verify: (target: string, salt: string, hash: Buffer) => boolean;
};
