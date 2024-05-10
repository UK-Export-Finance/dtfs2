import { isNonEmptyString } from '@ukef/dtfs2-common';
import { REGEX } from '../../../constants';

type ErrorSummaryItem = {
  text: string;
  href: string;
};

export type FindUtilisationReportByYearValidationErrors = {
  errorSummary: ErrorSummaryItem[];
  bankError: string | undefined;
  yearError: string | undefined;
};

const isBefore2024 = (year: number): boolean => year < 2024;

const isInTheFuture = (year: number): boolean => year > new Date().getFullYear();

const getYearInputValidationError = (yearQuery: string): string | undefined => {
  if (!isNonEmptyString(yearQuery) || !REGEX.YEAR.test(yearQuery)) {
    return 'Enter a valid year';
  }
  const parsedYear = Number(yearQuery);
  if (isBefore2024(parsedYear) || isInTheFuture(parsedYear)) {
    return 'Enter a year that is between 2024 and the current year';
  }
  return undefined;
};

const getBankInputValidationError = (bankIdQuery: string, validBankIds: string[]): string | undefined => {
  if (!isNonEmptyString(bankIdQuery) || !validBankIds.includes(bankIdQuery)) {
    return 'Select a bank';
  }
  return undefined;
};

type ValidateSearchInputParams = {
  bankIdQuery: string | undefined;
  yearQuery: string | undefined;
  validBankIds: string[];
};

export const validateSearchInput = ({
  bankIdQuery,
  yearQuery,
  validBankIds,
}: ValidateSearchInputParams): FindUtilisationReportByYearValidationErrors => {
  const bankError = bankIdQuery ? getBankInputValidationError(bankIdQuery, validBankIds) : 'Select a bank';
  const yearError = yearQuery ? getYearInputValidationError(yearQuery) : 'Enter a valid year';

  const errorSummary: ErrorSummaryItem[] = [];
  if (bankError) {
    errorSummary.push({ text: bankError, href: '#bank' });
  }
  if (yearError) {
    errorSummary.push({ text: yearError, href: '#year' });
  }

  return { errorSummary, bankError, yearError };
};
