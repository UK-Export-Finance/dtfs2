import { extractTotalSelectableFeeRecordsFromRequestBody } from './unlink-payment-fees-helper';

describe('unlink payment fees helper', () => {
  describe('extractTotalSelectableFeeRecordsFromRequestBody', () => {
    it('should extract totalSelectableFeeRecords when present', () => {
      const requestBody = {
        totalSelectableFeeRecords: '7',
      };

      const result = extractTotalSelectableFeeRecordsFromRequestBody(requestBody);

      expect(result).toEqual(7);
    });

    it('should return undefined for totalSelectableFeeRecords when not present', () => {
      const requestBody = {};

      const result = extractTotalSelectableFeeRecordsFromRequestBody(requestBody);

      expect(result).toEqual(undefined);
    });
  });
});
