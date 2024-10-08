import { UtilisationReportReconciliationStatus, IsoDateTimeStamp, IsoMonthStamp, ReportPeriod } from '@ukef/dtfs2-common';

export type UtilisationReportReconciliationSummaryItem = {
  reportId: string;
  reportPeriod: ReportPeriod;
  bank: {
    id: string;
    name: string;
  };
  status: UtilisationReportReconciliationStatus;
  dateUploaded?: IsoDateTimeStamp;
  totalFacilitiesReported?: number;
  totalFeesReported?: number;
  reportedFeesLeftToReconcile?: number;
};

export type UtilisationReportReconciliationSummary = {
  submissionMonth: IsoMonthStamp;
  items: UtilisationReportReconciliationSummaryItem[];
};

export type UtilisationReportSearchSummary = {
  bankName: string;
  year: string;
  reports: UtilisationReportReconciliationSummaryItem[];
};
