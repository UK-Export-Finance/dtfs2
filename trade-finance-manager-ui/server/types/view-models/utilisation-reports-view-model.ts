import { IsoMonthStamp } from '@ukef/dtfs2-common';
import { BaseViewModel } from './base-view-model';
import { UtilisationReportReconciliationSummaryItem } from '../utilisation-reports';

export type SummaryItemViewModel = UtilisationReportReconciliationSummaryItem & {
  displayStatus: string;
  formattedDateUploaded?: string;
  downloadPath?: string;
};

export type ReportPeriodSummaryViewModel = {
  items: SummaryItemViewModel[];
  submissionMonth: IsoMonthStamp;
  reportPeriodHeading: string;
  dueDateText: string;
};

export type SummaryViewModel = ReportPeriodSummaryViewModel[];

export type UtilisationReportsViewModel = BaseViewModel & {
  reportPeriodSummaries: SummaryViewModel;
};
