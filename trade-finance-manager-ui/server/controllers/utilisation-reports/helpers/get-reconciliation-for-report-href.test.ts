import { RECONCILIATION_FOR_REPORT_TABS } from '../../../constants/reconciliation-for-report-tabs';
import { getReconciliationForReportHref } from './get-reconciliation-for-report-href';

describe('getReconciliationForReportHref', () => {
  it('returns the reconciliation for report url with the specified report id without a tab specified when no redirectTab is supplied', () => {
    // Arrange
    const reportId = '12';

    // Act
    const href = getReconciliationForReportHref(reportId);

    // Assert
    expect(href).toEqual('/utilisation-reports/12');
  });

  it.each(Object.values(RECONCILIATION_FOR_REPORT_TABS))(
    'returns the reconciliation for report url with the specified report id and the supplied redirectTab',
    (redirectTab) => {
      // Arrange
      const reportId = '24';

      // Act
      const href = getReconciliationForReportHref(reportId, redirectTab);

      // Assert
      expect(href).toEqual(`/utilisation-reports/24#${redirectTab}`);
    },
  );
});
