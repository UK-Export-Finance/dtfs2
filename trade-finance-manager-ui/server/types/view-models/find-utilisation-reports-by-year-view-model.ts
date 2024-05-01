import { FindUtilisationReportByYearValidationErrors } from '../../controllers/utilisation-reports/find-reports-by-year/search-input-validator';
import { TfmSessionUser } from '../tfm-session-user';

export type FindUtilisationReportsByYearBankViewModel = {
  value: string;
  text: string;
  attributes: Record<string, string>;
};

export type FindUtilisationReportsByYearViewModel = FindUtilisationReportByYearValidationErrors & {
  user: TfmSessionUser;
  activePrimaryNavigation: string;
  bankItems: FindUtilisationReportsByYearBankViewModel[];
};
