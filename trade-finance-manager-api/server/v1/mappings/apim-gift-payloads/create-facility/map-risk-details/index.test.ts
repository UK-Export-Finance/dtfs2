import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../../constants';
import api from '../../../../api';
import { mapRiskDetails, mapFacilityCategoryCode, mapFacilityCreditRating } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

jest.mock('../../../../api');

describe('mapFacilityCreditRating', () => {
  describe('when the exporter credit rating is in the TFM_CREDIT_RATING_MAP', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockCreditRiskRatings = ['BB-', 'B+'];
      const mockExporterCreditRating = 'Good (BB-)';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      const expected = 'BB-';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is in the list of credit risk ratings', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockCreditRiskRatings = ['AAA', 'AA+', 'AA'];
      const mockExporterCreditRating = 'AAA';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      const expected = 'AAA';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is NOT in TFM_CREDIT_RATING_MAP or the list of credit risk ratings', () => {
    it('should return null', () => {
      // Arrange
      const mockCreditRiskRatings = ['AAA'];
      const mockExporterCreditRating = 'CCC';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('mapFacilityCategoryCode', () => {
  describe(`when productTypeCode is "${PRODUCT_TYPES.GEF}" and a facilityCategoryCode is provided`, () => {
    it('should return the provided facilityCategoryCode', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPES.GEF;
      const mockFacilityCategoryCode = 'Mock facility category code';

      // Act
      const result = mapFacilityCategoryCode(mockProductTypeCode, mockFacilityCategoryCode);

      // Assert
      const expected = mockFacilityCategoryCode;

      expect(result).toEqual(expected);
    });
  });

  describe(`when productTypeCode is "${PRODUCT_TYPES.GEF}" and a facilityCategoryCode is NOT provided`, () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPES.GEF;

      // Act
      const result = mapFacilityCategoryCode(mockProductTypeCode);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe(`when productTypeCode is NOT "${PRODUCT_TYPES.GEF}"`, () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPES.BSS;
      const mockFacilityCategoryCode = 'Mock facility category code';

      // Act
      const result = mapFacilityCategoryCode(mockProductTypeCode, mockFacilityCategoryCode);

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('mapRiskDetails', () => {
  const mockIndustryCode = '1406';
  const mockUkefIndustryCode = '1003';

  const params = {
    dealId: '123',
    creditRiskRatings: ['AAA', 'AA+', 'AA'],
    facilityCategoryCode: '',
    exporterCreditRating: 'AAA',
    industryCode: mockIndustryCode,
    productTypeCode: PRODUCT_TYPES.GEF,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call api.getUkefIndustryCodeByCompaniesHouseIndustryCode', async () => {
    // Arrange
    const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

    const getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn().mockResolvedValueOnce({ ukefIndustryCode: mockUkefIndustryCode });
    mockApi.getUkefIndustryCodeByCompaniesHouseIndustryCode = getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy;

    // Act
    await mapRiskDetails(params);

    // Assert
    expect(getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy).toHaveBeenCalledTimes(1);
  });

  it('should map TFM facility data to the format expected by APIM GIFT for "risk details" creation', async () => {
    // Act
    const result = await mapRiskDetails(params);

    // Assert
    const expected = {
      account: DEFAULTS.RISK_DETAILS.ACCOUNT,
      dealId: params.dealId,
      facilityCategoryCode: mapFacilityCategoryCode(params.productTypeCode, params.facilityCategoryCode),
      facilityCreditRating: mapFacilityCreditRating(params.creditRiskRatings, params.exporterCreditRating),
      riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
      ukefIndustryCode: mockUkefIndustryCode,
    };

    expect(result).toEqual(expected);
  });

  describe('when api.getUkefIndustryCodeByCompaniesHouseIndustryCode throws an error', () => {
    beforeEach(() => {
      // Arrange
      const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

      mockApi.getUkefIndustryCodeByCompaniesHouseIndustryCode = jest.fn().mockRejectedValueOnce(new Error());
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(mapRiskDetails(params)).resolves.not.toThrow();
    });

    it('should map TFM facility data to the format expected by APIM for GIFT "risk details" creation', async () => {
      // Act
      const result = await mapRiskDetails(params);

      // Assert
      // No need to assert specifics, that is asserted in the previous test - just assert that a result is returned with the expected shape
      expect(result).toBeDefined();
      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('dealId');
      expect(result).toHaveProperty('facilityCategoryCode');
      expect(result).toHaveProperty('facilityCreditRating');
      expect(result).toHaveProperty('riskStatus');
      expect(result).toHaveProperty('ukefIndustryCode');
    });
  });
});
