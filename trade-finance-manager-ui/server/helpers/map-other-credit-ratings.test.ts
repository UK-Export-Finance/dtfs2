import { CreditRiskRating, mapSelectOption } from '@ukef/dtfs2-common';
import api from '../api';
import { mapOtherCreditRatings } from './map-other-credit-ratings';

jest.mock('../api');
console.error = jest.fn();

describe('mapOtherCreditRatings', () => {
  const creditRiskRatings: CreditRiskRating[] = [
    {
      id: 1,
      name: 1,
      description: 'A',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveTo: '2026-12-31T23:59:59.999Z',
    },
    {
      id: 2,
      name: 2,
      description: 'B',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      effectiveTo: '2026-12-31T23:59:59.999Z',
    },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when a selectedValue is provided', () => {
    it('should return an array of select options with the selectedValue marked as selected', async () => {
      const selectedValue = 'A';
      jest.mocked(api.getCreditRiskRatings).mockResolvedValue(creditRiskRatings);

      const result = await mapOtherCreditRatings(selectedValue);

      const expected = creditRiskRatings.map((rating) => mapSelectOption(rating.description, rating.description, selectedValue));

      expect(result).toEqual(expected);
    });
  });

  describe('when no selectedValue is provided', () => {
    it('should include a default option', async () => {
      const selectedValue = '';
      jest.mocked(api.getCreditRiskRatings).mockResolvedValue(creditRiskRatings);

      const result = await mapOtherCreditRatings(selectedValue);

      const expectedDefaultOption = {
        disabled: true,
        selected: true,
        value: '',
        text: '',
      };

      const expected = [expectedDefaultOption, ...creditRiskRatings.map((rating) => mapSelectOption(rating.description, rating.description, selectedValue))];

      expect(result).toEqual(expected);
    });
  });

  describe('when selectedValue is undefined', () => {
    it('should include default option', async () => {
      const selectedValue = undefined;
      jest.mocked(api.getCreditRiskRatings).mockResolvedValue(creditRiskRatings);

      const result = await mapOtherCreditRatings(selectedValue);

      const expectedDefaultOption = {
        disabled: true,
        selected: true,
        value: '',
        text: '',
      };

      const expected = [expectedDefaultOption, ...creditRiskRatings.map((rating) => mapSelectOption(rating.description, rating.description, selectedValue))];

      expect(result).toEqual(expected);
    });
  });

  describe('when the API returns an empty array', () => {
    beforeEach(() => {
      jest.mocked(api.getCreditRiskRatings).mockResolvedValue([]);
    });

    it('should return false', async () => {
      const result = await mapOtherCreditRatings('A');

      expect(result).toBe(false);
    });

    it('should log an error', async () => {
      await mapOtherCreditRatings('A');

      expect(console.error).toHaveBeenCalledWith('mapOtherCreditRatings: No credit ratings found from the API.');
    });
  });

  describe('when the API returns false', () => {
    beforeEach(() => {
      jest.mocked(api.getCreditRiskRatings).mockResolvedValue(false);
    });

    it('should return false', async () => {
      const result = await mapOtherCreditRatings('A');

      expect(result).toBe(false);
    });

    it('should log an error', async () => {
      await mapOtherCreditRatings('A');

      expect(console.error).toHaveBeenCalledWith('mapOtherCreditRatings: No credit ratings found from the API.');
    });
  });

  describe('when the API call fails', () => {
    beforeEach(() => {
      jest.mocked(api.getCreditRiskRatings).mockRejectedValue(new Error('API error'));
    });

    it('should return false', async () => {
      const result = await mapOtherCreditRatings('A');

      expect(result).toBe(false);
    });

    it('should log an error', async () => {
      await mapOtherCreditRatings('A');

      expect(console.error).toHaveBeenCalledWith('Error mapping other credit ratings - mapOtherCreditRatings: %o', expect.any(Error));
    });
  });
});
