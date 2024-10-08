type CustomMatchers<R = unknown> = {
  toBeObjectId(received: R): void;
};

declare global {
  namespace jest {
    interface Expect {
      toBeObjectId(): void;
    }
    interface AsymmetricMatchers extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}
export {};
