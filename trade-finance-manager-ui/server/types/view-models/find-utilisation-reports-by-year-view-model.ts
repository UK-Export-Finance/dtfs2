import { FindUtilisationReportByYearValidationErrors } from '../../controllers/utilisation-reports/find-reports-by-year/search-input-validator';
import { BaseViewModel } from './base-view-model';

export type FindUtilisationReportsByYearBankViewModel = {
  value: string;
  text: string;
  attributes?: Record<string, string>;
};

export type BankReportingYearsDataListViewModel = {
  bankId: string;
  reportingYears: number[];
};

export type FindUtilisationReportsByYearViewModel = BaseViewModel &
  FindUtilisationReportByYearValidationErrors & {
    bankItems: FindUtilisationReportsByYearBankViewModel[];
    bankReportingYearsDataLists: BankReportingYearsDataListViewModel[];
    selectedBank?: string;
    selectedYear?: string;
  };
