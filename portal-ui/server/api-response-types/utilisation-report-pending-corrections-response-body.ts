import { IsoDateTimeStamp, PendingCorrection, ReportPeriod } from '@ukef/dtfs2-common';

export type NonEmptyPendingCorrectionsResponseBody = {
  reportPeriod: ReportPeriod;
  uploadedByFullName: string;
  dateUploaded: IsoDateTimeStamp;
  corrections: PendingCorrection[];
  nextDueReportPeriod: ReportPeriod;
};

export type UtilisationReportPendingCorrectionsResponseBody = NonEmptyPendingCorrectionsResponseBody | Record<string, never>;
