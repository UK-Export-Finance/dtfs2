import { getRecordCorrectionRequestCancelLinkHref } from './get-record-correction-request-cancel-link-href';

describe('get-record-correction-request-cancel-link-href', () => {
  describe('getRecordCorrectionRequestCancelLinkHref', () => {
    it('should return the correct URL path for canceling a correction request', () => {
      // Arrange
      const reportId = '123';
      const feeRecordId = '456';
      const expectedPath = '/utilisation-reports/123/create-record-correction-request/456/cancel';

      // Act
      const result = getRecordCorrectionRequestCancelLinkHref(reportId, feeRecordId);

      // Assert
      expect(result).toEqual(expectedPath);
    });
  });
});
