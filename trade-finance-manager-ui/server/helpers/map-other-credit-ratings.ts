import { CREDIT_RATINGS, mapSelectOption } from '@ukef/dtfs2-common';

/**
 * Maps the other credit ratings to an array of select options for the accessible autocomplete select component
 * If a selectedValue is provided, it will be marked as selected in the returned array.
 * If no selectedValue is provided, a default option will be included at the beginning of the array.
 * @param selectedValue The value that should be marked as selected.
 * @returns An array of select options, including a default option if no selectedValue is provided.
 */
export const mapOtherCreditRatings = (selectedValue?: string) => {
  let creditRatings = CREDIT_RATINGS.map((rating: string) => mapSelectOption(rating, rating, selectedValue));

  if (!selectedValue) {
    const defaultOption = {
      disabled: true,
      selected: true,
      value: '',
      text: '',
    };

    creditRatings = [defaultOption, ...creditRatings];
  }

  return creditRatings;
};
