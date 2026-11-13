import { IsoMonthStamp } from '@ukef/dtfs2-common';
import { UtilisationReportReconciliationSummaryItem } from '@tfm-ui/types/utilisation-reports';
import { UtilisationReportDisplayFrequency } from '@tfm-ui/types/utilisation-report-display-frequency';
import { BaseViewModel } from './base-view-model';

export type UtilisationReportSummaryViewModel = UtilisationReportReconciliationSummaryItem & {
  frequency: UtilisationReportDisplayFrequency;
  displayStatus: string;
  formattedDateUploaded?: string;
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
  isPDCReconcileUser: boolean;
};
