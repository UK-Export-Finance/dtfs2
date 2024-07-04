import { extractTotalSelectableFeeRecordsFromRequestBody } from './unlink-payment-fees-helper';

describe('unlink payment fees helper', () => {
  describe('extractTotalSelectableFeeRecordsFromRequestBody', () => {
    it('should extract totalSelectableFeeRecords when present', () => {
      const totalSelectableFeeRecords = '7';
      const requestBody = {
        totalSelectableFeeRecords,
      };

      const result = extractTotalSelectableFeeRecordsFromRequestBody(requestBody);

      expect(result).toEqual({
        totalSelectableFeeRecords,
      });
    });

    it('should return undefined for totalSelectableFeeRecords when not present', () => {
      const requestBody = {};

      const result = extractTotalSelectableFeeRecordsFromRequestBody(requestBody);

      expect(result).toEqual({
        totalSelectableFeeRecords: undefined,
      });
    });
  });
});
