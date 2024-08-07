import { IsoMonthStamp } from '@ukef/dtfs2-common';
import { BaseViewModel } from './base-view-model';
import { UtilisationReportReconciliationSummaryItem } from '../utilisation-reports';

export type UtilisationReportDisplayFrequency = 'Monthly' | 'Quarterly';

export type UtilisationReportSummaryViewModel = UtilisationReportReconciliationSummaryItem & {
  frequency: UtilisationReportDisplayFrequency;
  displayStatus: string;
  formattedDateUploaded?: string;
  downloadPath?: string;
};

export type ReportPeriodSummaryViewModel = {
  items: UtilisationReportSummaryViewModel[];
  submissionMonth: IsoMonthStamp;
  reportPeriodHeading: string;
  dueDateText: string;
};

export type ReportPeriodSummariesViewModel = ReportPeriodSummaryViewModel[];

export type UtilisationReportsViewModel = BaseViewModel & {
  reportPeriodSummaries: ReportPeriodSummariesViewModel;
};
