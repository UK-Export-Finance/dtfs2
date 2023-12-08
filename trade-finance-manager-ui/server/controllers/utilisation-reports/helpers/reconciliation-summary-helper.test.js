const { getReportReconciliationSummaryViewModel } = require('./reconciliation-summary-helper');
const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY = require('../../../test-mocks/mock-utilisation-report-reconciliation-summary');
const UTILISATION_REPORT_RECONCILIATION_STATUS = require('../../../constants/utilisation-report-reconciliation-status');

describe('reconciliation-summary-helper', () => {
  describe('getReportReconciliationSummaryViewModel', () => {
    it('returns the summary item with an additional displayStatus property', () => {
      // Arrange
      const reportNotReceivedSummaryItem = {
        ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY[0],
        statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      };

      // Act
      const result = getReportReconciliationSummaryViewModel([reportNotReceivedSummaryItem]);

      // Assert
      const expectedResult = [
        {
          ...reportNotReceivedSummaryItem,
          displayStatus: 'Not received',
        },
      ];

      expect(result).toEqual(expectedResult);
    });
  });
});
