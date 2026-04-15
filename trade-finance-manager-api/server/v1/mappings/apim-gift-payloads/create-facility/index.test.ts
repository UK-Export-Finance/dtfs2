import { DEAL_TYPE, Facility, getTfmUkefDealId, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-BSS-EWCS-AIN-submitted';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { getDealTypeFlags } from './get-deal-type-flags';
import { mapProductTypeCode } from './map-product-type-code';
import { getIndustryCode } from '../get-industry-code';
import { mapPartyUrns } from './map-party-urns';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { mapApimCreditRiskRatings } from '../../map-apim-credit-risk-ratings';
import { mapAccrualSchedules } from './map-accrual-schedules';
import { mapCounterparties } from './map-counterparties';
import { mapObligations } from './map-obligations';
import api from '../../../api';
import { CreditRiskRating } from '../../../api-response-types/credit-risk-rating';
import { FacilityCategory } from '../../../api-response-types/facility-category';
import { createFacility } from '.';

const mockFacilitySnapshot = MOCK_FACILITIES[0] as unknown as Facility;
const mockTfmGefDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;

jest.mock('../../../api');

describe('createFacility', () => {
  const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;
  let getCreditRiskRatingsSpy = jest.fn();
  let getFacilityCategoriesSpy = jest.fn();
  let getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn();

  const mockFacility: TfmFacility = {
    _id: new ObjectId(),
    facilitySnapshot: mockFacilitySnapshot,
    tfm: {
      ukefExposure: 100000,
      facilityGuaranteeDates: {
        guaranteeCommencementDate: '2024-01-01',
        guaranteeExpiryDate: '2025-01-01',
      },
    },
  };

  const { facilitySnapshot, tfm } = mockFacility;

  const mockUkefIndustryCode = '1003';

  const mockCreditRiskRatings: CreditRiskRating[] = [
    {
      id: 1,
      name: 1,
      description: 'AAA',
      createdAt: '2026-01-14T14:15:00.943Z',
      updatedAt: '2026-01-14T14:15:00.943Z',
      effectiveFrom: '2026-01-14T14:15:00.943Z',
      effectiveTo: '9999-12-31T00:00:00.000Z',
    },
    {
      id: 2,
      name: 2,
      description: 'AA+',
      createdAt: '2026-01-14T14:15:00.943Z',
      updatedAt: '2026-01-14T14:15:00.943Z',
      effectiveFrom: '2026-01-14T14:15:00.943Z',
      effectiveTo: '9999-12-31T00:00:00.000Z',
    },
  ];

  const mockFacilityCategories: FacilityCategory[] = [
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
  ];

  const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(mockTfmGefDeal.dealSnapshot.dealType);

  const productTypeCode = mapProductTypeCode({
    isBssEwcsDeal,
    isGefDeal,
    facilityCategoryCode: facilitySnapshot.type,
  });

  const params = {
    deal: mockTfmGefDeal,
    facility: mockFacility,
  };

  beforeEach(() => {
    jest.resetAllMocks();

    // Arrange
    getCreditRiskRatingsSpy = jest.fn().mockResolvedValueOnce(mockCreditRiskRatings);
    mockApi.getCreditRiskRatings = getCreditRiskRatingsSpy;

    getFacilityCategoriesSpy = jest.fn().mockResolvedValueOnce(mockFacilityCategories);
    mockApi.getFacilityCategories = getFacilityCategoriesSpy;

    getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn().mockResolvedValue({ ukefIndustryCode: mockUkefIndustryCode });
    mockApi.getUkefIndustryCodeByCompaniesHouseIndustryCode = getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy;
  });

  it('should call api.getCreditRiskRatings', async () => {
    // Act
    await createFacility(params);

    // Assert
    expect(getCreditRiskRatingsSpy).toHaveBeenCalledTimes(1);
  });

  describe(`when the deal is a ${DEAL_TYPE.GEF} deal`, () => {
    it('should call api.getFacilityCategories', async () => {
      // Act
      await createFacility(params);

      // Assert
      expect(getFacilityCategoriesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe(`when the deal is a ${DEAL_TYPE.BSS_EWCS} deal`, () => {
    it('should NOT call api.getFacilityCategories', async () => {
      // Arrange
      const mockBssEwcsDeal = MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED as unknown as TfmDeal;

      params.deal = mockBssEwcsDeal;

      // Act
      await createFacility(params);

      // Assert
      expect(getFacilityCategoriesSpy).not.toHaveBeenCalled();
    });

    it('should map obligations with a bssSubtypeName', async () => {
      // Arrange
      const mockBssEwcsDeal = MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED as unknown as TfmDeal;

      params.deal = mockBssEwcsDeal;

      // Act
      const result = await createFacility(params);

      // Assert
      const expected = mapObligations({
        bssSubtypeName: facilitySnapshot.bondType,
        currency: facilitySnapshot.currency.id,
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        isBssEwcsDeal: true,
        isGefDeal: false,
        maturityDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
        ukefExposure: Number(tfm.ukefExposure),
      });

      expect(result.obligations).toEqual(expected);
    });
  });

  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', async () => {
    // Arrange
    params.deal = mockTfmGefDeal;

    // Act
    const result = await createFacility(params);

    // Assert
    const expiryDate = String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate);

    const expected = {
      consumer: APIM_GIFT_INTEGRATION.CONSUMER,
      overview: mapOverview({
        bankInternalRefName: mockTfmGefDeal.dealSnapshot.bankInternalRefName,
        currency: facilitySnapshot.currency.id,
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        expiryDate,
        exporterPartyUrn: mockTfmGefDeal.tfm.parties.exporter.partyUrn,
        facilityAmount: Number(tfm.ukefExposure),
        facilityType: facilitySnapshot.type,
        isGefDeal,
        productTypeCode,
        ukefFacilityId: String(facilitySnapshot.ukefFacilityId),
      }),
      accrualSchedules: mapAccrualSchedules({
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        maturityDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
        dayCountBasis: facilitySnapshot.dayCountBasis,
        feeFrequency: facilitySnapshot.feeFrequency,
        guaranteeFeePayableToUkef: String(facilitySnapshot.guaranteeFeePayableToUkef),
      }),
      counterparties: mapCounterparties({
        isBssEwcsDeal,
        isGefDeal,
        partyUrns: mapPartyUrns({
          deal: mockTfmGefDeal,
          isBssEwcsDeal,
          isGefDeal,
        }),
        startDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        exitDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
      }),
      obligations: mapObligations({
        bssSubtypeName: isBssEwcsDeal ? String(facilitySnapshot.bondType) : undefined,
        currency: facilitySnapshot.currency.id,
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        isBssEwcsDeal,
        facilityType: facilitySnapshot.type,
        isGefDeal,
        maturityDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
        ukefExposure: Number(tfm.ukefExposure),
      }),
      riskDetails: await mapRiskDetails({
        creditRiskRatings: mapApimCreditRiskRatings(mockCreditRiskRatings),
        dealId: getTfmUkefDealId(mockTfmGefDeal),
        exporterCreditRating: mockTfmGefDeal.tfm.exporterCreditRating,
        facilityType: facilitySnapshot.type,
        facilityCategories: mockFacilityCategories,
        industryCode: getIndustryCode(mockTfmGefDeal),
        isGefDeal,
      }),
    };

    expect(result).toEqual(expected);
  });

  describe('when api.getCreditRiskRatings throws an error', () => {
    beforeEach(() => {
      // Arrange
      mockApi.getCreditRiskRatings = jest.fn().mockRejectedValueOnce(new Error());
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(createFacility(params)).resolves.not.toThrow();
    });

    it('should map TFM facility data to the format expected by APIM for GIFT facility creation', async () => {
      // Act
      const result = await createFacility(params);

      // Assert
      // No need to assert specifics, that is asserted in the previous test - just assert that a result is returned with the expected shape
      expect(result).toBeDefined();
      expect(result).toHaveProperty('consumer');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('accrualSchedules');
      expect(result).toHaveProperty('counterparties');
      expect(result).toHaveProperty('obligations');
      expect(result).toHaveProperty('riskDetails');
    });
  });

  describe('when api.getCreditRiskRatings returns false (API error without throw)', () => {
    beforeEach(() => {
      // Arrange
      mockApi.getCreditRiskRatings = jest.fn().mockResolvedValueOnce(false);
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(createFacility(params)).resolves.not.toThrow();
    });

    it('should return a result with the expected shape', async () => {
      // Act
      const result = await createFacility(params);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('consumer');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('accrualSchedules');
      expect(result).toHaveProperty('counterparties');
      expect(result).toHaveProperty('obligations');
      expect(result).toHaveProperty('riskDetails');
    });
  });

  describe('when api.getFacilityCategories throws an error', () => {
    beforeEach(() => {
      // Arrange
      mockApi.getFacilityCategories = jest.fn().mockRejectedValueOnce(new Error());
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(createFacility(params)).resolves.not.toThrow();
    });

    it('should map TFM facility data to the format expected by APIM for GIFT facility creation', async () => {
      // Act
      const result = await createFacility(params);

      // Assert
      // No need to assert specifics, that is asserted in the previous test - just assert that a result is returned with the expected shape
      expect(result).toBeDefined();
      expect(result).toHaveProperty('consumer');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('accrualSchedules');
      expect(result).toHaveProperty('counterparties');
      expect(result).toHaveProperty('obligations');
      expect(result).toHaveProperty('riskDetails');
    });
  });

  describe('when api.getFacilityCategories returns false (API error without throw)', () => {
    beforeEach(() => {
      // Arrange
      mockApi.getFacilityCategories = jest.fn().mockResolvedValueOnce(false);
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(createFacility(params)).resolves.not.toThrow();
    });

    it('should return a result with the expected shape', async () => {
      // Act
      const result = await createFacility(params);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('consumer');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('accrualSchedules');
      expect(result).toHaveProperty('counterparties');
      expect(result).toHaveProperty('obligations');
      expect(result).toHaveProperty('riskDetails');
    });
  });
});
