import {
  PENDING_RECONCILIATION,
  RECONCILIATION_COMPLETED,
  RECONCILIATION_IN_PROGRESS,
  REPORT_NOT_RECEIVED,
  UtilisationReportReconciliationStatus,
} from '@ukef/dtfs2-common';
import { MOCK_BANKS } from './mock-banks';
import { UtilisationReportReconciliationSummary, UtilisationReportReconciliationSummaryItem } from '../types/utilisation-reports';

export const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS: Record<UtilisationReportReconciliationStatus, UtilisationReportReconciliationSummaryItem> = {
  REPORT_NOT_RECEIVED: {
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    reportId: '65784d376fe2fe26168990e8',
    bank: {
      id: MOCK_BANKS.BARCLAYS.id,
      name: MOCK_BANKS.BARCLAYS.name,
    },
    status: REPORT_NOT_RECEIVED,
  },
  PENDING_RECONCILIATION: {
    reportId: '65784d376fe2fe26168990e7',
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    bank: {
      id: MOCK_BANKS.HSBC.id,
      name: MOCK_BANKS.HSBC.name,
    },
    status: PENDING_RECONCILIATION,
    dateUploaded: '2023-12-01T15:04:53Z',
    totalFacilitiesReported: 4,
    totalFeesReported: 4,
    reportedFeesLeftToReconcile: 4,
  },
  RECONCILIATION_IN_PROGRESS: {
    reportId: '65784d402e1ea1fbb8414c0b',
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    bank: {
      id: MOCK_BANKS.NEWABLE.id,
      name: MOCK_BANKS.NEWABLE.name,
    },
    status: RECONCILIATION_IN_PROGRESS,
    dateUploaded: '2023-12-03T17:04:23Z',
    totalFacilitiesReported: 4,
    totalFeesReported: 4,
    reportedFeesLeftToReconcile: 2,
  },
  RECONCILIATION_COMPLETED: {
    reportId: '65784d4953165930828976ae',
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    bank: {
      id: MOCK_BANKS.LLOYDS.id,
      name: MOCK_BANKS.LLOYDS.name,
    },
    status: RECONCILIATION_COMPLETED,
    dateUploaded: '2023-12-13T09:23:10Z',
    totalFacilitiesReported: 4,
    totalFeesReported: 4,
    reportedFeesLeftToReconcile: 0,
  },
};

export const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY: UtilisationReportReconciliationSummary[] = [
  {
    submissionMonth: '2023-12',
    items: [
      MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.REPORT_NOT_RECEIVED,
      MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
      MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.RECONCILIATION_IN_PROGRESS,
      MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.RECONCILIATION_COMPLETED,
    ],
  },
];
