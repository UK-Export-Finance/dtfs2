import { CREDIT_RATINGS, mapSelectOption } from '@ukef/dtfs2-common';
import { mapOtherCreditRatings } from './map-other-credit-ratings';

describe('mapOtherCreditRatings', () => {
  it('should return an array of select options with the selectedValue marked as selected', () => {
    const selectedValue = 'A';

    const result = mapOtherCreditRatings(selectedValue);

    const expected = CREDIT_RATINGS.map((rating: string) => mapSelectOption(rating, rating, selectedValue));

    expect(result).toEqual(expected);
  });

  it('should include a default option when no selectedValue is provided', () => {
    const selectedValue = '';

    const result = mapOtherCreditRatings(selectedValue);

    const expectedDefaultOption = {
      disabled: true,
      selected: true,
      value: '',
      text: '',
    };

    const expected = [expectedDefaultOption, ...CREDIT_RATINGS.map((rating: string) => mapSelectOption(rating, rating, selectedValue))];

    expect(result).toEqual(expected);
  });

  it('should include default option when selected value is undefined', () => {
    const selectedValue = undefined;

    const result = mapOtherCreditRatings(selectedValue);

    const expectedDefaultOption = {
      disabled: true,
      selected: true,
      value: '',
      text: '',
    };

    const expected = [expectedDefaultOption, ...CREDIT_RATINGS.map((rating: string) => mapSelectOption(rating, rating, selectedValue))];

    expect(result).toEqual(expected);
  });
});
