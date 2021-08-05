const mapBssEwcsFacility = require('./map-bss-ewcs-facility');
const MOCK_FACILIIES = require('../../__mocks__/mock-facilities');

describe('mappings - map submitted deal - mapSubmittedDeal', () => {
  it('should return mapped facility', () => {
    const mockFacility = {
      ...MOCK_FACILIIES[0],
      tfm: {},
    };

    const result = mapBssEwcsFacility(mockFacility);

    const {
      _id,
      ukefFacilityID,
      facilityType,
      facilityValue,
      currency,
      coveredPercentage,
      ukefExposure,
      ukefGuaranteeInMonths,
      previousFacilityStage,
      hasBeenAcknowledged,
      facilityStage,
      requestedCoverStartDate,
      dayCountBasis,
      guaranteeFeePayableByBank,
      feeType,
      premiumType,
      feeFrequency,
      premiumFrequency,
    } = mockFacility;

    const expected = {
      _id,
      ukefFacilityID,
      facilityType,
      currency,
      value: facilityValue,
      coverPercentage: coveredPercentage,
      ukefExposure,
      coverStartDate: requestedCoverStartDate,
      ukefGuaranteeInMonths,
      facilityStage,
      previousFacilityStage,
      hasBeenAcknowledged,
      'coverEndDate-year': mockFacility['coverEndDate-year'],
      'coverEndDate-month': mockFacility['coverEndDate-month'],
      'coverEndDate-day': mockFacility['coverEndDate-day'],
      guaranteeFeePayableByBank,
      dayCountBasis,
      feeFrequency,
      premiumFrequency,
      feeType,
      premiumType,
      tfm: mockFacility.tfm,
    };

    expect(result).toEqual(expected);
  });
});
