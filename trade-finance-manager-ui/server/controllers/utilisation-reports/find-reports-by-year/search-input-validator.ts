import { isNonEmptyString } from "@ukef/dtfs2-common";
import { getYear } from "date-fns";

export type validationError = {
  searchField: string;
  errorMessage: string;
}

export const validateSearchInput = (bank: unknown, year: unknown, allBanks: string[]): validationError[] => {
  const validationErrors: validationError[] = [];
  if (!bank && !year) {
    return validationErrors;
  }

  if (!bank || !isNonEmptyString(bank)) {
    validationErrors.push({ searchField: "bank", errorMessage: "A bank must be selected" });
  } else if (!allBanks.includes(bank)) {
      validationErrors.push({ searchField: "bank", errorMessage: "The bank should be opted in" });
    }

  if (!year) {
    validationErrors.push({ searchField: "year", errorMessage: "A year must be entered" });
  } else {
    const currentYear: number = getYear(new Date());
    if (Number(year) < 2023 || Number(year) > currentYear) {
      validationErrors.push({ searchField: "year", errorMessage: `The year should be between 2023 and ${currentYear}` });
    }
  }

  return validationErrors;
};