import { IsoDateTimeStamp, ReportPeriod } from '@ukef/dtfs2-common';

type PendingCorrection = {
  correctionId: number;
  facilityId: string;
  exporter: string;
  additionalInfo: string;
};

export type NonEmptyPendingCorrectionsResponseBody = {
  reportPeriod: ReportPeriod;
  uploadedByFullName: string;
  dateUploaded: IsoDateTimeStamp;
  reportId: number;
  corrections: PendingCorrection[];
  nextDueReportPeriod: ReportPeriod;
};

export type UtilisationReportPendingCorrectionsResponseBody = NonEmptyPendingCorrectionsResponseBody | Record<string, never>;
