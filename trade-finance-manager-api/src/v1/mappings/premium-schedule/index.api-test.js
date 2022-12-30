const mapPremiumScheduleFacility = require('.');
const { mapPremiumFrequencyId, mapPremiumTypeId } = require('./map-premium-ids');
const mapProductGroup = require('./map-product-group');
const { mapBssEwcsFacility } = require('../map-submitted-deal/map-bss-ewcs-facility');
const { stripCommas } = require('../../../utils/string');

const { MOCK_FACILITIES } = require('../../__mocks__/mock-facilities');

describe('mapPremiumScheduleFacility', () => {
  const mappedFacility = mapBssEwcsFacility(MOCK_FACILITIES[1]);
  // Facility with commas in amount
  const mappedCommaFacility = mapBssEwcsFacility(MOCK_FACILITIES[6]);

  const mockFacility = {
    ...mappedFacility,
    // NOTE: BSS dayCountBasis is a string. GEF has an integer.
    // Mock a number so that we can test it gets converted to a string.
    dayCountBasis: Number(mappedFacility.dayCountBasis),
  };

  const mockCommaFacility = {
    ...mappedCommaFacility,
    dayCountBasis: Number(mappedCommaFacility.dayCountBasis),
  };

  const mockExposurePeriod = 25;

  const mockGuaranteeDates = {
    guaranteeCommencementDate: '2021-05-01',
    guaranteeExpiryDate: '2023-05-01',
  };

  it('should return null if params are invalid', () => {
    const result = mapPremiumScheduleFacility({}, 0, {});
    expect(result).toEqual(null);
  });

  it('should return mapped object', () => {
    const facility = mockFacility;

    const result = mapPremiumScheduleFacility(facility, mockExposurePeriod, mockGuaranteeDates);

    const expected = {
      cumulativeAmount: mockFacility.disbursementAmount,
      dayBasis: String(mockFacility.dayCountBasis),
      exposurePeriod: mockExposurePeriod,
      facilityURN: mockFacility.ukefFacilityId,
      guaranteeCommencementDate: mockGuaranteeDates.guaranteeCommencementDate,
      guaranteeExpiryDate: mockGuaranteeDates.guaranteeExpiryDate,
      guaranteeFeePercentage: mockFacility.guaranteeFee,
      guaranteePercentage: mockFacility.coverPercentage,
      maximumLiability: mockFacility.ukefExposure,
      premiumTypeId: mapPremiumTypeId(mockFacility),
      premiumFrequencyId: mapPremiumFrequencyId(mockFacility),
      productGroup: mapProductGroup(mockFacility.type),
    };
    expect(result).toEqual(expected);
  });

  it('should default cumulativeAmount to 0 when disbursementAmount does not exist', () => {
    const facility = {
      ...mockFacility,
      disbursementAmount: null,
    };

    const result = mapPremiumScheduleFacility(facility, mockExposurePeriod, mockGuaranteeDates);

    expect(result.cumulativeAmount).toEqual(0);
  });

  it('Should strip commas for `maximumLiability` and `cumulativeAmount` property, if present in the property value', () => {
    const facility = mockCommaFacility;
    const result = mapPremiumScheduleFacility(facility, mockExposurePeriod, mockGuaranteeDates);
    const expected = {
      cumulativeAmount: Number(stripCommas(mockCommaFacility.disbursementAmount)),
      dayBasis: String(mockCommaFacility.dayCountBasis),
      exposurePeriod: mockExposurePeriod,
      facilityURN: mockCommaFacility.ukefFacilityId,
      guaranteeCommencementDate: mockGuaranteeDates.guaranteeCommencementDate,
      guaranteeExpiryDate: mockGuaranteeDates.guaranteeExpiryDate,
      guaranteeFeePercentage: mockCommaFacility.guaranteeFee,
      guaranteePercentage: mockCommaFacility.coverPercentage,
      maximumLiability: Number(stripCommas(mockCommaFacility.ukefExposure)),
      premiumTypeId: mapPremiumTypeId(mockCommaFacility),
      premiumFrequencyId: mapPremiumFrequencyId(mockCommaFacility),
      productGroup: mapProductGroup(mockCommaFacility.type),
    };

    expect(result).toEqual(expected);
  });
});
