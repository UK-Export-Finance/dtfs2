import { PENDING_RECONCILIATION } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../../../src/types/utilisation-reports';
import { MOCK_BANKS } from '../banks';

const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEM: UtilisationReportReconciliationSummaryItem = {
  reportId: 12,
  reportPeriod: { start: { month: 1, year: 2023 }, end: { month: 1, year: 2023 } },
  bank: {
    id: MOCK_BANKS.BARCLAYS.id,
    name: MOCK_BANKS.BARCLAYS.name,
  },
  status: PENDING_RECONCILIATION,
  dateUploaded: new Date('2024-01-14T15:36:00Z'),
  totalFacilitiesReported: 3,
  totalFeesReported: 4,
  reportedFeesLeftToReconcile: 2,
};

export const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY: UtilisationReportReconciliationSummary = {
  submissionMonth: '2024-01',
  items: [MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEM],
};
