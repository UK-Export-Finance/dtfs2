import { PrimaryNavigationKey } from '../primary-navigation-key';
import { TfmSessionUser } from '../tfm-session-user';
import { UtilisationReportReconciliationSummaryItem } from '../utilisation-reports';

export type UtilisationReportsByBankAndYearViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
  bankName: string;
  year: string;
  reports: UtilisationReportReconciliationSummaryItem[];
  isTfmPaymentReconciliationFeatureFlagEnabled: boolean;
};
