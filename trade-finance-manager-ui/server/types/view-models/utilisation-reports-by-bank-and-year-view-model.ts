import { UtilisationReportReconciliationSummaryItem } from '../utilisation-reports';
import { BaseViewModel } from './base-view-model';

export type FindReportSummaryItemViewModel = UtilisationReportReconciliationSummaryItem & {
  formattedReportPeriod: string;
  displayStatus: string;
  formattedDateUploaded?: string;
};

export type UtilisationReportsByBankAndYearViewModel = BaseViewModel & {
  bankName: string;
  year: string;
  reports: FindReportSummaryItemViewModel[];
  isTfmPaymentReconciliationFeatureFlagEnabled: boolean;
};
