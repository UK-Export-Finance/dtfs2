import { isNonEmptyString } from '@ukef/dtfs2-common';
import { REGEX } from '../../../constants';

type Error = {
  text: string;
  href: string;
};

export type FindUtilisationReportByYearValidationErrors = {
  errorSummary: Error[];
  bankError: string | undefined;
  yearError: string | undefined;
};

const isBefore2024 = (year: number): boolean => year < 2024;

const isInTheFuture = (year: number): boolean => year > new Date().getFullYear();

const validateYearInputAndReturnErrorMessageIfInvalid = (year: unknown): string | undefined => {
  const validYearRegex = new RegExp(REGEX.YEAR);
  if (!year || !isNonEmptyString(year) || !validYearRegex.test(year)) {
    return 'Enter a valid year';
  }
  const yearParsed = Number(year);
  if (isBefore2024(yearParsed) || isInTheFuture(yearParsed)) {
    return 'Enter a year that is between 2024 and the current year';
  }
  return undefined;
};

const validateBankInputAndReturnErrorMessageIfInvalid = (bankId: unknown, allBankIds: string[]): string | undefined => {
  if (!bankId || !isNonEmptyString(bankId) || !allBankIds.includes(bankId)) {
    return 'Select a bank';
  }
  return undefined;
};

export const validateSearchInput = (
  bankId: unknown,
  year: unknown,
  allBankIds: string[],
): FindUtilisationReportByYearValidationErrors => {
  if (!bankId && !year) {
    return { errorSummary: [], bankError: undefined, yearError: undefined };
  }

  const errorSummary: Error[] = [];
  const bankError = validateBankInputAndReturnErrorMessageIfInvalid(bankId, allBankIds);
  const yearError = validateYearInputAndReturnErrorMessageIfInvalid(year);

  if (bankError) {
    errorSummary.push({ text: bankError, href: '#bank' });
  }

  if (yearError) {
    errorSummary.push({ text: yearError, href: '#year' });
  }

  return { errorSummary, bankError, yearError };
};
