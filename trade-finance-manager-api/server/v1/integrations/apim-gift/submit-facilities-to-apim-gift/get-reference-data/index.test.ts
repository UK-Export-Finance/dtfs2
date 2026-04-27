import { DEAL_TYPE } from '@ukef/dtfs2-common';
import api from '../../../../api';
import { getReferenceData } from '.';
import { mapApimCreditRiskRatings } from '../../../../mappings/map-apim-credit-risk-ratings';
import { MOCK_CREDIT_RISK_RATINGS } from '../../../../__mocks__/mock-credit-risk-ratings';
import { MOCK_FACILITY_CATEGORIES } from '../../../../__mocks__/mock-facility-categories';

jest.mock('../../../../api');

describe('getReferenceData', () => {
  const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

  let getCreditRiskRatingsSpy = jest.fn();
  let getFacilityCategoriesSpy = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // Arrange
    getCreditRiskRatingsSpy = jest.fn().mockResolvedValueOnce(MOCK_CREDIT_RISK_RATINGS);
    mockApi.getCreditRiskRatings = getCreditRiskRatingsSpy;

    getFacilityCategoriesSpy = jest.fn().mockResolvedValueOnce(MOCK_FACILITY_CATEGORIES);
    mockApi.getFacilityCategories = getFacilityCategoriesSpy;
  });

  it('should call api.getCreditRiskRatings', async () => {
    // Arrange
    const isGefDeal = true;

    // Act
    await getReferenceData(isGefDeal);

    // Assert
    expect(getCreditRiskRatingsSpy).toHaveBeenCalledTimes(1);
  });

  describe(`when the deal is a ${DEAL_TYPE.GEF} deal`, () => {
    it('should call api.getFacilityCategories', async () => {
      // Arrange
      const isGefDeal = true;

      // Act
      await getReferenceData(isGefDeal);

      // Assert
      expect(getFacilityCategoriesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe(`when the deal is a ${DEAL_TYPE.BSS_EWCS} deal`, () => {
    it('should NOT call api.getFacilityCategories', async () => {
      // Arrange
      const isGefDeal = false;

      // Act
      await getReferenceData(isGefDeal);

      // Assert
      expect(getFacilityCategoriesSpy).not.toHaveBeenCalled();
    });
  });

  it('should return creditRiskRatings and facilityCategories', async () => {
    // Arrange
    const isGefDeal = true;

    // Act
    const result = await getReferenceData(isGefDeal);

    // Assert
    const expected = {
      creditRiskRatings: mapApimCreditRiskRatings(MOCK_CREDIT_RISK_RATINGS),
      facilityCategories: MOCK_FACILITY_CATEGORIES,
    };

    expect(result).toEqual(expected);
  });

  describe('when api.getCreditRiskRatings throws an error', () => {
    // Arrange
    const isGefDeal = true;

    beforeEach(() => {
      // Arrange
      mockApi.getCreditRiskRatings = jest.fn().mockRejectedValueOnce(new Error());
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(getReferenceData(isGefDeal)).resolves.not.toThrow();
    });

    it('should return with creditRiskRatings as an empty array', async () => {
      // Act
      const result = await getReferenceData(isGefDeal);

      // Assert
      const expected = {
        creditRiskRatings: [],
        facilityCategories: MOCK_FACILITY_CATEGORIES,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when api.getCreditRiskRatings returns false (API error without throw)', () => {
    // Arrange
    const isGefDeal = true;

    beforeEach(() => {
      // Arrange
      mockApi.getCreditRiskRatings = jest.fn().mockResolvedValueOnce(false);
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(getReferenceData(isGefDeal)).resolves.not.toThrow();
    });

    it('should return with creditRiskRatings as an empty array', async () => {
      // Act
      const result = await getReferenceData(isGefDeal);

      // Assert
      const expected = {
        creditRiskRatings: [],
        facilityCategories: MOCK_FACILITY_CATEGORIES,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when api.getFacilityCategories throws an error', () => {
    // Arrange
    const isGefDeal = true;

    beforeEach(() => {
      // Arrange
      mockApi.getFacilityCategories = jest.fn().mockRejectedValueOnce(new Error());
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(getReferenceData(isGefDeal)).resolves.not.toThrow();
    });

    it('should return with facilityCategories as an empty array', async () => {
      // Act
      const result = await getReferenceData(isGefDeal);

      // Assert
      const expected = {
        creditRiskRatings: mapApimCreditRiskRatings(MOCK_CREDIT_RISK_RATINGS),
        facilityCategories: [],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when api.getFacilityCategories returns false (API error without throw)', () => {
    // Arrange
    const isGefDeal = true;

    beforeEach(() => {
      // Arrange
      mockApi.getFacilityCategories = jest.fn().mockResolvedValueOnce(false);
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(getReferenceData(isGefDeal)).resolves.not.toThrow();
    });

    it('should return with facilityCategories as an empty array', async () => {
      // Act
      const result = await getReferenceData(isGefDeal);

      // Assert
      const expected = {
        creditRiskRatings: mapApimCreditRiskRatings(MOCK_CREDIT_RISK_RATINGS),
        facilityCategories: [],
      };

      expect(result).toEqual(expected);
    });
  });
});
