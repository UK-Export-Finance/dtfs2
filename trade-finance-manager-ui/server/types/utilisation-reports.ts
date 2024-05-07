import {
  UtilisationReportReconciliationStatus,
  IsoDateTimeStamp,
  IsoMonthStamp,
  ReportPeriod,
} from '@ukef/dtfs2-common';

export type UtilisationReportReconciliationSummaryItem = {
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

export type UtilisationReportReconciliationSummary = {
  submissionMonth: IsoMonthStamp;
  items: UtilisationReportReconciliationSummaryItem[];
};
