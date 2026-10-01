import { CREDIT_RATING_TFM, CREDIT_RATING } from '@ukef/dtfs2-common';
import { mapSelectedCreditRating } from './map-selected-credit-rating';

describe('mapSelectedCreditRating', () => {
  describe(`when the selected value is ${CREDIT_RATING_TFM.BB_MINUS}`, () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating(CREDIT_RATING_TFM.BB_MINUS);

      const expected = {
        goodSelected: true,
        acceptableSelected: false,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when the selected value is ${CREDIT_RATING.BB_MINUS}`, () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating(CREDIT_RATING.BB_MINUS);

      const expected = {
        goodSelected: true,
        acceptableSelected: false,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when the selected value is ${CREDIT_RATING_TFM.B_PLUS}`, () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating(CREDIT_RATING_TFM.B_PLUS);

      const expected = {
        goodSelected: false,
        acceptableSelected: true,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when the selected value is ${CREDIT_RATING.B_PLUS}`, () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating(CREDIT_RATING.B_PLUS);

      const expected = {
        goodSelected: false,
        acceptableSelected: true,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the selected value is other and has a value', () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating('Some Other Value');

      const expected = {
        goodSelected: false,
        acceptableSelected: false,
        otherSelected: true,
        otherCreditRatingValue: 'Some Other Value',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the selected value is null, undefined, or empty string', () => {
    it.each([null, undefined, ''])('should return correct mapping for %s', (selectedValue) => {
      const result = mapSelectedCreditRating(selectedValue as string);

      const expected = {
        goodSelected: false,
        acceptableSelected: false,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });
});
