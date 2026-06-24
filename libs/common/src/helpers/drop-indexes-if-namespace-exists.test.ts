import { dropIndexesIfNamespaceExists } from './drop-indexes-if-namespace-exists';

describe('dropIndexesIfNamespaceExists', () => {
  describe('when the collection exists', () => {
    it('should call dropIndexes exactly once and resolve', async () => {
      const dropIndexes = jest.fn().mockResolvedValue({ nIndexesWas: 3, ok: 1 });

      await dropIndexesIfNamespaceExists({ dropIndexes });

      expect(dropIndexes).toHaveBeenCalledTimes(1);
    });
  });

  describe('when dropIndexes throws NamespaceNotFound (code 26)', () => {
    it('should swallow the error so the caller can proceed against a fresh database', async () => {
      const namespaceNotFound = Object.assign(new Error('ns not found'), {
        code: 26,
        codeName: 'NamespaceNotFound',
      });
      const dropIndexes = jest.fn().mockRejectedValue(namespaceNotFound);

      await dropIndexesIfNamespaceExists({ dropIndexes });

      expect(dropIndexes).toHaveBeenCalledTimes(1);
    });
  });

  describe('when dropIndexes throws an error with a different MongoDB code', () => {
    it('should rethrow the original error so real failures are not masked', async () => {
      const otherError = Object.assign(new Error('permission denied'), { code: 13 });
      const dropIndexes = jest.fn().mockRejectedValue(otherError);

      await expect(dropIndexesIfNamespaceExists({ dropIndexes })).rejects.toBe(otherError);
    });
  });

  describe('when dropIndexes throws an error without a code field', () => {
    it('should rethrow the original error', async () => {
      const opaqueError = new Error('network down');
      const dropIndexes = jest.fn().mockRejectedValue(opaqueError);

      await expect(dropIndexesIfNamespaceExists({ dropIndexes })).rejects.toBe(opaqueError);
    });
  });

  describe('when dropIndexes throws an error whose `code` is non-numeric', () => {
    it.each([
      ['the string "26"', '26'],
      ['a boolean', true],
      ['null', null],
      ['an object', { value: 26 }],
    ])('should rethrow when `code` is %s', async (_label, codeValue) => {
      const errorWithNonNumericCode = Object.assign(new Error('weird'), { code: codeValue });
      const dropIndexes = jest.fn().mockRejectedValue(errorWithNonNumericCode);

      await expect(dropIndexesIfNamespaceExists({ dropIndexes })).rejects.toBe(errorWithNonNumericCode);
    });
  });

  describe.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'oops'],
    ['a number', 42],
  ])('when dropIndexes rejects with %s (non-object value)', (_label, thrown) => {
    it('should rethrow the rejected value', async () => {
      const dropIndexes = jest.fn().mockRejectedValue(thrown);

      await expect(dropIndexesIfNamespaceExists({ dropIndexes })).rejects.toBe(thrown);
    });
  });
});
