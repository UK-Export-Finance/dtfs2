import { isNonEmptyString } from "@ukef/dtfs2-common";
import { REGEX } from "../../../constants";

type Error = {
  text: string;
  href: string;
}

type ValidationErrors = {
  errorSummary: Error[];
  bankError: string | undefined;
  yearError: string | undefined;
}

export const validateSearchInput = (bank: unknown, year: unknown, allBanks: string[]): ValidationErrors => {
  const errorSummary: Error[] = [];
  let bankError = undefined;
  let yearError = undefined;

  if (!bank && !year) {
    return {errorSummary, bankError, yearError};
  };

  if (!bank || !isNonEmptyString(bank) || !allBanks.includes(bank)) {
    const errorMessage = "Select a bank";
    errorSummary.push({ text: errorMessage, href: "#bank" });
    bankError = errorMessage;
  };

  const validYearRegex = new RegExp(REGEX.YEAR);
  if (!year || !isNonEmptyString(year) || !validYearRegex.test(year)) {
    const errorMessage = "Enter a valid year";
    errorSummary.push({ text: errorMessage, href: "#year" });
    yearError = errorMessage;
  };

  return {errorSummary, bankError, yearError};
};