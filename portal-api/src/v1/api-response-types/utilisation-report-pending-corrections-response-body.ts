import { IsoDateTimeStamp, PendingCorrection, ReportPeriod } from '@ukef/dtfs2-common';

export type UtilisationReportPendingCorrectionsResponseBody =
  | {
      reportPeriod: ReportPeriod;
      uploadedByFullName: string;
      dateUploaded: IsoDateTimeStamp;
      corrections: PendingCorrection[];
      nextDueReportPeriod: ReportPeriod;
    }
  | Record<string, never>;
