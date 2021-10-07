const mapPremiumScheduleFacility = require('./mapPremiumScheduleFacility');
const { getPremiumFrequencyId, getPremiumTypeId } = require('../helpers/get-premium-frequency-values');
const { mapBssEwcsFacility } = require('./map-submitted-deal/map-bss-ewcs-facility');

const MOCK_FACILIIES = require('../__mocks__/mock-facilities');

describe('mapPremiumScheduleFacility', () => {
  const mockFacility = mapBssEwcsFacility(MOCK_FACILIIES[0]);

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
      cumulativeAmount: 0,
      dayBasis: mockFacility.dayCountBasis,
      exposurePeriod: mockExposurePeriod,
      facilityURN: mockFacility.ukefFacilityID,
      guaranteeCommencementDate: mockGuaranteeDates.guaranteeCommencementDate,
      guaranteeExpiryDate: mockGuaranteeDates.guaranteeExpiryDate,
      guaranteeFeePercentage: mockFacility.guaranteeFee,
      guaranteePercentage: mockFacility.coverPercentage,
      maximumLiability: mockFacility.ukefExposure,
      premiumTypeId: getPremiumTypeId(mockFacility),
      premiumFrequencyId: getPremiumFrequencyId(mockFacility),
      productGroup: 'BS',
    };
    expect(result).toEqual(expected);
  });

  // describe('Loan', () => {
  //   it('should map cumulativeAmount', () => {
  //     const result = mapPremiumScheduleFacility(mockLoan, mockFacilityExposurePeriod, mockFacilityGuaranteeDates);

  //     const expected = Number(stripCommas(mockLoan.disbursementAmount));

  //     expect(result.cumulativeAmount).toEqual(expected);
  //   });
  // });
});
