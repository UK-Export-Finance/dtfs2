import { IsoDateTimeStamp, ReportPeriod, UtilisationReportStatus } from '@ukef/dtfs2-common';

export type UtilisationReportSummaryItem = {
  reportId: string;
  reportPeriod: ReportPeriod;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportStatus;
  dateUploaded?: IsoDateTimeStamp;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
};

export type UtilisationReportSummariesByBankAndYearResponseBody = {
  bankName: string;
  year: string;
  reports: UtilisationReportSummaryItem[];
};
