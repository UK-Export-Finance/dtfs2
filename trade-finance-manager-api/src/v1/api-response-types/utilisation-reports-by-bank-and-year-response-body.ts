import { IsoDateTimeStamp, ReportPeriod, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';

export type UtilisationReportSummaryItem = {
  reportId: string;
  reportPeriod: ReportPeriod;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  dateUploaded?: IsoDateTimeStamp;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
};

export type UtilisationReportSummariesByBankAndYearResponseBody = {
  bankName: string;
  year: string;
  reports: UtilisationReportSummaryItem[];
};
