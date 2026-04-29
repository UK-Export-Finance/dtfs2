import { Facility, getTfmUkefDealId, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS } from '../../../__mocks__/mock-credit-risk-ratings';
import { MOCK_FACILITY_CATEGORIES } from '../../../__mocks__/mock-facility-categories';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { getDealTypeFlags } from './get-deal-type-flags';
import { getGuaranteeFeePayableToUkef } from './get-guarantee-fee-payable-to-ukef';
import { mapProductTypeCode } from './map-product-type-code';
import { getIndustryCode } from '../get-industry-code';
import { mapPartyUrns } from './map-party-urns';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { mapAccrualSchedules } from './map-accrual-schedules';
import { mapCounterparties } from './map-counterparties';
import { mapObligations } from './map-obligations';
import api from '../../../api';
import { createFacility } from '.';

const mockDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;
const mockFacilitySnapshot = MOCK_FACILITIES[0] as unknown as Facility;

jest.mock('../../../api');

describe('createFacility', () => {
  const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;
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

  const { isBssEwcsDeal, isGefDeal } = getDealTypeFlags(mockDeal.dealSnapshot.dealType);

  const productTypeCode = mapProductTypeCode({
    isBssEwcsDeal,
    isGefDeal,
    facilityCategoryCode: facilitySnapshot.type,
  });

  const guaranteeFeePayableToUkef = getGuaranteeFeePayableToUkef({
    facilitySnapshot,
    isBssEwcsDeal,
    isGefDeal,
  });

  const params = {
    deal: mockDeal,
    facility: mockFacility,
    isBssEwcsDeal,
    isGefDeal,
    creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
    facilityCategories: MOCK_FACILITY_CATEGORIES,
  };

  beforeEach(() => {
    jest.resetAllMocks();

    // Arrange
    getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy = jest.fn().mockResolvedValue({ ukefIndustryCode: mockUkefIndustryCode });
    mockApi.getUkefIndustryCodeByCompaniesHouseIndustryCode = getUkefIndustryCodeByCompaniesHouseIndustryCodeSpy;
  });

  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', async () => {
    // Arrange
    params.deal = mockDeal;

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
        facilityType: facilitySnapshot.type,
        isGefDeal,
        productTypeCode,
        ukefFacilityId: String(facilitySnapshot.ukefFacilityId),
      }),
      accrualSchedules: mapAccrualSchedules({
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        maturityDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
        dayCountBasis: Number(facilitySnapshot.dayCountBasis),
        feeFrequency: facilitySnapshot.feeFrequency,
        feeType: facilitySnapshot.feeType,
        guaranteeFeePayableToUkef,
      }),
      counterparties: mapCounterparties({
        isBssEwcsDeal,
        isGefDeal,
        partyUrns: mapPartyUrns({
          deal: mockDeal,
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
        creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
        dealId: getTfmUkefDealId(mockDeal),
        exporterCreditRating: mockDeal.tfm.exporterCreditRating,
        facilityType: facilitySnapshot.type,
        facilityCategories: MOCK_FACILITY_CATEGORIES,
        industryCode: getIndustryCode(mockDeal),
        isGefDeal,
      }),
    };

    expect(result).toEqual(expected);
  });
});
