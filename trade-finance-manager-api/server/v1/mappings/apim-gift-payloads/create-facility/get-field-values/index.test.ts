import { ObjectId } from 'mongodb';
import { Facility, getTfmUkefDealId, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { MOCK_FACILITIES } from '../../../../__mocks__/mock-facilities';
import MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED from '../../../../__mocks__/mock-TFM-deal-BSS-EWCS-AIN-submitted';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { getBssSubtypeName } from '../get-bss-subtype-name';
import { getEwcsSupplierType } from '../get-ewcs-supplier-type';
import { getFacilityTypeFlags } from '../get-facility-type-flags';
import { getGuaranteeFeePayableToUkef } from '../get-guarantee-fee-payable-to-ukef';
import { getIndustryCode } from '../../get-industry-code';
import { mapCoverPercentage } from '../map-cover-percentage';
import { mapFacilityAmount } from '../map-overview/map-facility-amount';
import { mapPartyUrns } from '../map-party-urns';
import { mapProductTypeCode } from '../map-product-type-code';
import { getFieldValues } from '.';

const mockDeal = MOCK_TFM_DEAL_BSS_EWCS_AIN_SUBMITTED as unknown as TfmDeal;
const mockFacilitySnapshot = MOCK_FACILITIES[1] as unknown as Facility;

const mockFacility: TfmFacility = {
  _id: new ObjectId(),
  facilitySnapshot: mockFacilitySnapshot,
  tfm: {
    exposurePeriodInMonths: 12,
    facilityGuaranteeDates: {
      guaranteeCommencementDate: '2024-01-01',
      guaranteeExpiryDate: '2025-01-01',
    },
    ukefExposure: 100000,
  },
};

const facilityFlags = getFacilityTypeFlags(mockFacilitySnapshot.type);

describe('getFieldValues', () => {
  it('should return the expected field values for a given deal and facility', () => {
    // Arrange
    const params = {
      deal: mockDeal,
      facility: mockFacility,
    };

    // Act
    const result = getFieldValues(params);

    // Assert
    const expected = {
      bssSubtypeName: getBssSubtypeName({
        facilitySnapshot: mockFacilitySnapshot,
        isBssFacility: facilityFlags.isBssFacility,
      }),
      consumer: APIM_GIFT_INTEGRATION.CONSUMER,
      currency: mockFacilitySnapshot.currency.id,
      dayCountBasis: Number(mockFacilitySnapshot.dayCountBasis),
      dealId: getTfmUkefDealId(mockDeal),
      effectiveDate: String(mockFacility.tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
      ewcsSupplierType: getEwcsSupplierType(mockDeal),
      expiryDate: String(mockFacility.tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
      exporterCreditRating: mockDeal.tfm.exporterCreditRating,
      facilityAmount: mapFacilityAmount({
        facilityAmount: mockFacilitySnapshot.value,
        coverPercentage: mapCoverPercentage({
          facilitySnapshot: mockFacilitySnapshot,
          ...facilityFlags,
        }),
      }),
      facilityFlags,
      facilityType: mockFacilitySnapshot.type,
      feeFrequency: mockFacilitySnapshot.feeFrequency,
      feeType: mockFacilitySnapshot.feeType,
      guaranteeFeePayableToUkef: getGuaranteeFeePayableToUkef({
        facilitySnapshot: mockFacilitySnapshot,
        ...facilityFlags,
      }),
      industryCode: getIndustryCode(mockDeal),
      monthsOfCover: Number(mockFacility.tfm.exposurePeriodInMonths),
      productTypeCode: mapProductTypeCode(facilityFlags),
      partyUrns: mapPartyUrns({
        deal: mockDeal,
        ...facilityFlags,
      }),
    };

    expect(result).toEqual(expected);
  });
});
