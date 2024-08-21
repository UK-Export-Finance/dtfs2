import { getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage } from './get-back-link-href';

console.error = jest.fn();

describe('getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage', () => {
  const reportId = '123';

  it('returns URL without params when feeRecordIds array is empty', () => {
    // Arrange
    const feeRecordIds: number[] = [];

    // Act
    const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123');
  });

  it('returns URL without params when total length exceeds limit', () => {
    // Arrange
    const feeRecordIds = [...Array(1000).keys()];

    // Act
    const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123');
  });

  it('returns URL with params when feeRecordIds array has one element', () => {
    // Arrange
    const feeRecordIds = [1];

    // Act
    const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123?selectedFeeRecordIds=1');
  });

  it('returns URL with params when total length is within limit', () => {
    // Arrange
    const feeRecordIds = [1, 22, 333];

    // Act
    const result = getAddToExistingPaymentBackLinkToUtilisationReportReconciliationPage(reportId, feeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123?selectedFeeRecordIds=1%2C22%2C333');
  });
});
