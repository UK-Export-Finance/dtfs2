import { FindUtilisationReportByYearValidationErrors } from '../../controllers/utilisation-reports/find-reports-by-year/search-input-validator';
import { PrimaryNavigationKey } from '../primary-navigation-key';
import { TfmSessionUser } from '../tfm-session-user';

export type FindUtilisationReportsByYearBankViewModel = {
  value: string;
  text: string;
  attributes?: Record<string, string>;
};

export type FindUtilisationReportsByYearViewModel = FindUtilisationReportByYearValidationErrors & {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
  bankItems: FindUtilisationReportsByYearBankViewModel[];
  selectedBank?: string;
  selectedYear?: string;
};
