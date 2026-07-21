import { mapSelectOption, CreditRiskRating } from '@ukef/dtfs2-common';
import api from '../api';

/**
 * Maps the other credit ratings to an array of select options for the accessible autocomplete select component
 * If a selectedValue is provided, it will be marked as selected in the returned array.
 * If no selectedValue is provided, a default option will be included at the beginning of the array.
 * @param selectedValue The value that should be marked as selected.
 * @returns An array of select options, including a default option if no selectedValue is provided.
 */
export const mapOtherCreditRatings = async (selectedValue?: string) => {
  try {
    const creditRatingsAPI = await api.getCreditRiskRatings();

    if (!creditRatingsAPI || creditRatingsAPI.length === 0) {
      console.error('mapOtherCreditRatings: No credit ratings found from the API.');
      return false;
    }

    let creditRatings = creditRatingsAPI.map((rating: CreditRiskRating) => mapSelectOption(rating.description, rating.description, selectedValue));

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
  } catch (error) {
    console.error('Error mapping other credit ratings - mapOtherCreditRatings: %o', error);
    return false;
  }
};
