import { mapSelectedCreditRating } from './map-selected-credit-rating';

describe('mapSelectedCreditRating', () => {
  describe('when the selected value is Good (BB-)', () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating('Good (BB-)');

      const expected = {
        goodSelected: true,
        acceptableSelected: false,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the selected value is BB-', () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating('BB-');

      const expected = {
        goodSelected: true,
        acceptableSelected: false,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the selected value is Acceptable (B+)', () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating('Acceptable (B+)');

      const expected = {
        goodSelected: false,
        acceptableSelected: true,
        otherSelected: false,
        otherCreditRatingValue: '',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the selected value is B+', () => {
    it('should return correct mapping', () => {
      const result = mapSelectedCreditRating('B+');

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
