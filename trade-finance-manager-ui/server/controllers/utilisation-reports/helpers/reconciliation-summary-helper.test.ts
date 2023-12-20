import { getReportReconciliationSummaryViewModel } from './reconciliation-summary-helper';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS } from '../../../test-mocks/mock-utilisation-report-reconciliation-summary';

describe('reconciliation-summary-helper', () => {
  describe('getReportReconciliationSummaryViewModel', () => {
    it('returns summary items with the additional view model properties', () => {
      // Arrange
      const reportNotReceivedSummaryItem = MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.REPORT_NOT_RECEIVED;
      const pendingReconciliationSummaryItem = {
        ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
        dateUploaded: '2023-12-03T15:45:00Z',
      };
      const summaryApiResponse = [reportNotReceivedSummaryItem, pendingReconciliationSummaryItem];

      // Act
      const result = getReportReconciliationSummaryViewModel(summaryApiResponse);

      // Assert
      const expectedResult = [
        {
          ...reportNotReceivedSummaryItem,
          displayStatus: 'Not received',
        },
        {
          ...pendingReconciliationSummaryItem,
          displayStatus: 'Pending reconciliation',
          formattedDateUploaded: '3 Dec 2023',
          downloadPath: `/utilisation-reports/${pendingReconciliationSummaryItem.reportId}/download`,
        },
      ];

      expect(result).toEqual(expectedResult);
    });
  });
});
