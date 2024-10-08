import { isNonEmptyString } from '@ukef/dtfs2-common';
import { REGEX } from '../../../constants';
import { ErrorSummaryViewModel } from '../../../types/view-models';

export type FindUtilisationReportByYearValidationErrors = {
  errorSummary: ErrorSummaryViewModel[];
  bankError: string | undefined;
  yearError: string | undefined;
};

type FindUtilisationReportByYearValidation = FindUtilisationReportByYearValidationErrors & {
  bankIdAsString: string;
  yearAsString: string;
};

const isBefore2024 = (year: number): boolean => year < 2024;

const isInTheFuture = (year: number): boolean => year > new Date().getFullYear();

const getYearInputValidationError = (yearQuery: string): { yearError: string | undefined; yearAsString: string } => {
  if (!isNonEmptyString(yearQuery) || !REGEX.YEAR.test(yearQuery)) {
    return { yearError: 'Enter a valid year', yearAsString: '' };
  }
  const parsedYear = Number(yearQuery);
  if (isBefore2024(parsedYear) || isInTheFuture(parsedYear)) {
    return { yearError: 'Enter a year that is between 2024 and the current year', yearAsString: '' };
  }
  return { yearError: undefined, yearAsString: yearQuery };
};

const getBankInputValidationError = (bankIdQuery: string, validBankIds: string[]): { bankError: string | undefined; bankIdAsString: string } => {
  if (!isNonEmptyString(bankIdQuery) || !validBankIds.includes(bankIdQuery)) {
    return { bankError: 'Select a bank', bankIdAsString: '' };
  }
  return { bankError: undefined, bankIdAsString: bankIdQuery };
};

type ValidateSearchInputParams = {
  bankIdQuery: string | undefined;
  yearQuery: string | undefined;
  validBankIds: string[];
};

export const validateSearchInput = ({ bankIdQuery, yearQuery, validBankIds }: ValidateSearchInputParams): FindUtilisationReportByYearValidation => {
  const { bankError, bankIdAsString } = bankIdQuery
    ? getBankInputValidationError(bankIdQuery, validBankIds)
    : { bankError: 'Select a bank', bankIdAsString: '' };
  const { yearError, yearAsString } = yearQuery ? getYearInputValidationError(yearQuery) : { yearError: 'Enter a valid year', yearAsString: '' };

  const errorSummary: ErrorSummaryViewModel[] = [];
  if (bankError) {
    errorSummary.push({ text: bankError, href: '#bank' });
  }
  if (yearError) {
    errorSummary.push({ text: yearError, href: '#year' });
  }

  return { errorSummary, bankError, yearError, bankIdAsString, yearAsString };
};
