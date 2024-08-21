import { getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage } from './get-back-link-href';

console.error = jest.fn();

describe('getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage', () => {
  describe('should return URL without params', () => {
    it('when feeRecordIds array is empty', () => {
      // Arrange
      const reportId = '123';
      const feeRecordIds: number[] = [];

      // Act
      const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

      // Assert
      expect(result).toBe('/utilisation-reports/123');
    });

    it('when total length exceeds limit', () => {
      // Arrange
      const reportId = '123';
      const feeRecordIds = [...Array(1000).keys()];

      // Act
      const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

      // Assert
      expect(result).toBe('/utilisation-reports/123');
    });
  });

  describe('should return URL with params', () => {
    it('when feeRecordIds array has one element', () => {
      // Arrange
      const reportId = '123';
      const feeRecordIds = [1];

      // Act
      const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

      // Assert
      expect(result).toBe('/utilisation-reports/123?selectedFeeRecordIds=1');
    });

    it('when total length is within limit', () => {
      // Arrange
      const reportId = '123';
      const feeRecordIds = [1, 2, 3];

      // Act
      const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

      // Assert
      expect(result).toBe('/utilisation-reports/123?selectedFeeRecordIds=1%2C2%2C3');
    });
  });
});
