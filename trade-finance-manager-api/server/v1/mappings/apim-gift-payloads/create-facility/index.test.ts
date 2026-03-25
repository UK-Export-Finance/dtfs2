import { Facility, getTfmUkefDealId, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { getDealTypeFlags } from './get-deal-type-flags';
import { mapProductTypeCode } from './map-product-type-code';
import { getIndustryCode } from '../get-industry-code';
import { mapPartyUrns } from './map-party-urns';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { mapApimCreditRiskRatings } from '../../map-apim-credit-risk-ratings';
import { mapCounterparties } from './map-counterparties';
import { mapObligations } from './map-obligations';
import { mapRepaymentProfiles } from './map-repayment-profiles';
import api from '../../../api';
import { CreditRiskRating } from '../../../api-response-types/credit-risk-rating';
import { createFacility } from '.';

const mockFacilitySnapshot = MOCK_FACILITIES[0] as unknown as Facility;
const mockTfmDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;

jest.mock('../../../api');

describe('createFacility', () => {
  const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;
  let getCreditRiskRatingsSpy = jest.fn();
  let getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn();

  const mockDeal = mockTfmDeal;

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

  const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(mockDeal.dealSnapshot.dealType);

  const productTypeCode = mapProductTypeCode({
    isBssEwcsDeal,
    isGefDeal,
    facilityCategoryCode: facilitySnapshot.type,
  });

  const params = {
    deal: mockDeal,
    facility: mockFacility,
  };

  beforeEach(() => {
    jest.resetAllMocks();

    // Arrange
    getCreditRiskRatingsSpy = jest.fn().mockResolvedValueOnce(mockCreditRiskRatings);
    mockApi.getCreditRiskRatings = getCreditRiskRatingsSpy;

    getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn().mockResolvedValue({ ukefIndustryCode: mockUkefIndustryCode });
    mockApi.getUkefIndustryCodeByCompaniesHouseIndustryCode = getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy;
  });

  it('should call api.getCreditRiskRatings', async () => {
    // Act
    await createFacility(params);

    // Assert
    expect(getCreditRiskRatingsSpy).toHaveBeenCalledTimes(1);
  });

  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', async () => {
    // Act
    const result = await createFacility(params);

    // Assert
    const expiryDate = String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate);

    const expected = {
      consumer: APIM_GIFT_INTEGRATION.CONSUMER,
      overview: mapOverview({
        bankInternalRefName: mockDeal.dealSnapshot.bankInternalRefName,
        currency: facilitySnapshot.currency.id,
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        expiryDate,
        exporterPartyUrn: mockDeal.tfm.parties.exporter.partyUrn,
        facilityAmount: Number(tfm.ukefExposure),
        facilityCategoryCode: String(facilitySnapshot.type),
        isGefDeal,
        productTypeCode,
        ukefFacilityId: String(facilitySnapshot.ukefFacilityId),
      }),
      counterparties: mapCounterparties({
        isBssEwcsDeal,
        partyUrns: mapPartyUrns({
          deal: mockDeal,
          isBssEwcsDeal,
          isGefDeal,
        }),
        startDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        exitDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
      }),
      obligations: mapObligations({
        currency: facilitySnapshot.currency.id,
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        maturityDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
        subtypeName: String(facilitySnapshot.bondType),
        ukefExposure: Number(tfm.ukefExposure),
      }),
      repaymentProfiles: mapRepaymentProfiles({
        amount: Number(tfm.ukefExposure),
        dueDate: expiryDate,
      }),
      riskDetails: await mapRiskDetails({
        creditRiskRatings: mapApimCreditRiskRatings(mockCreditRiskRatings),
        dealId: getTfmUkefDealId(mockDeal),
        exporterCreditRating: mockDeal.tfm.exporterCreditRating,
        facilityCategoryCode: String(facilitySnapshot.type),
        industryCode: getIndustryCode(mockDeal),
        productTypeCode,
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
      expect(result).toHaveProperty('counterparties');
      expect(result).toHaveProperty('obligations');
      expect(result).toHaveProperty('repaymentProfiles');
      expect(result).toHaveProperty('riskDetails');
    });
  });
});
