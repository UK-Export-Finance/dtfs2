import { NonEmptyPendingCorrectionsResponseBody } from '../../server/api-response-types';
import { aReportPeriod } from './report-period';

export const aNonEmptyPendingCorrectionsResponseBody = (): NonEmptyPendingCorrectionsResponseBody => ({
  reportPeriod: aReportPeriod(),
  uploadedByFullName: 'John Doe',
  dateUploaded: '2023-01-01T00:00:00.000Z',
  corrections: [
    {
      correctionId: 1,
      facilityId: '123',
      exporter: 'exporter',
      additionalInfo: 'additional info',
    },
  ],
  nextDueReportPeriod: aReportPeriod(),
  reportId: 1,
});
