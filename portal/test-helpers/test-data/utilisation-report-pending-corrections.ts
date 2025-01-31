import { CURRENCY, PendingCorrection, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { NonEmptyPendingCorrectionsResponseBody } from '../../server/api-response-types';
import { aReportPeriod } from './report-period';

export const aPendingCorrection = (): PendingCorrection => ({
  correctionId: 1,
  facilityId: '123',
  exporter: 'exporter',
  additionalInfo: 'additional info',
  reasons: [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT],
  reportedFees: {
    currency: CURRENCY.GBP,
    amount: 100,
  },
});

export const aNonEmptyPendingCorrectionsResponseBody = (): NonEmptyPendingCorrectionsResponseBody => ({
  reportPeriod: aReportPeriod(),
  uploadedByFullName: 'John Doe',
  dateUploaded: '2023-01-01T00:00:00.000Z',
  corrections: [aPendingCorrection()],
  nextDueReportPeriod: aReportPeriod(),
});
