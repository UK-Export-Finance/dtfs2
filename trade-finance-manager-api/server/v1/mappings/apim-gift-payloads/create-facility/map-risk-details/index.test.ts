import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES } from '../../constants';
import api from '../../../../api';
import { mapFacilityCategoryCode } from './map-facility-category-code';
import { mapFacilityCreditRating } from './map-facility-credit-rating';
import { mapRiskDetails } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

jest.mock('../../../../api');

const mockFacilityCategories = [
  {
    type: 'Facility Category',
    typeCode: 'facilityCategory',
    code: 'FCT003',
    description: 'Bond: Supplemental To Credit',
    isActive: true,
  },
  {
    type: 'Facility Category',
    typeCode: 'facilityCategory',
    code: 'FCT006',
    description: 'GEF: Contingent',
    isActive: true,
  },
  {
    type: 'Facility Category',
    typeCode: 'facilityCategory',
    code: 'FCT007',
    description: 'GEF: Cash Advances',
    isActive: true,
  },
];

describe('mapRiskDetails', () => {
  const mockIndustryCode = '1406';
  const mockUkefIndustryCode = '1003';

  const params = {
    dealId: '123',
    creditRiskRatings: ['AAA', 'AA+', 'AA'],
    facilityCategoryCode: '',
    facilityCategories: mockFacilityCategories,
    exporterCreditRating: 'AAA',
    industryCode: mockIndustryCode,
    isGefDeal: true,
    productTypeCode: PRODUCT_TYPE_CODES.GEF,
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
    // Arrange
    const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

    const getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn().mockResolvedValueOnce({ ukefIndustryCode: mockUkefIndustryCode });
    mockApi.getUkefIndustryCodeByCompaniesHouseIndustryCode = getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy;

    // Act
    const result = await mapRiskDetails(params);

    // Assert
    const expected = {
      account: DEFAULTS.RISK_DETAILS.ACCOUNT,
      dealId: params.dealId,
      facilityCategoryCode: mapFacilityCategoryCode({
        facilityCategoryCode: params.facilityCategoryCode,
        facilityCategories: params.facilityCategories,
        isGefDeal: params.isGefDeal,
      }),
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
