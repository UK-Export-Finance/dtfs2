export type ByteGenerator = {
  randomBytes: (numberOfBytes: number) => Buffer;
  randomHexString: (numberOfBytes: number) => string;
};
