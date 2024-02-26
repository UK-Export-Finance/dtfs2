import { UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import { IsoDateTimeStamp, IsoMonthStamp } from './date';

export type UtilisationReportReconciliationSummaryItem = {
  reportId: string;
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

export type ReportWithStatus = {
  status: UtilisationReportReconciliationStatus;
  reportId: string;
};
