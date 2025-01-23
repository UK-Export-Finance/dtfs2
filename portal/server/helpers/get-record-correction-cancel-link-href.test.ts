import { getRecordCorrectionCancelLinkHref } from './get-record-correction-cancel-link-href';

describe('get-record-correction-cancel-link-href', () => {
  describe('getRecordCorrectionCancelLinkHref', () => {
    it('should return the correct URL path for canceling a correction', () => {
      // Arrange
      const correctionId = '123';
      const expectedPath = '/utilisation-reports/cancel-correction/123';

      // Act
      const result = getRecordCorrectionCancelLinkHref(correctionId);

      // Assert
      expect(result).toBe(expectedPath);
    });
  });
});
