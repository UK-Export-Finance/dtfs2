import { getLinkToPremiumPaymentsTab } from './get-link-to-premium-payments-tab';

console.error = jest.fn();

describe('getLinkToPremiumPaymentsTab', () => {
  const reportId = '123';

  it('returns URL without params when selectedFeeRecordIds array is empty', () => {
    // Arrange
    const selectedFeeRecordIds: number[] = [];

    // Act
    const result = getLinkToPremiumPaymentsTab(reportId, selectedFeeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123');
  });

  it('returns URL without params when total length exceeds limit', () => {
    // Arrange
    const selectedFeeRecordIds = [...Array(1000).keys()];

    // Act
    const result = getLinkToPremiumPaymentsTab(reportId, selectedFeeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123');
  });

  it('returns URL with params when selectedFeeRecordIds array has one element', () => {
    // Arrange
    const selectedFeeRecordIds = [1];

    // Act
    const result = getLinkToPremiumPaymentsTab(reportId, selectedFeeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123?selectedFeeRecordIds=1');
  });

  it('returns URL with params when total length is within limit', () => {
    // Arrange
    const selectedFeeRecordIds = [1, 22, 333];

    // Act
    const result = getLinkToPremiumPaymentsTab(reportId, selectedFeeRecordIds);

    // Assert
    expect(result).toBe('/utilisation-reports/123?selectedFeeRecordIds=1%2C22%2C333');
  });
});
