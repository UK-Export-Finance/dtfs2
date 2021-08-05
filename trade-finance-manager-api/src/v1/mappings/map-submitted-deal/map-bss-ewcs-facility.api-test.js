const mapBssEwcsFacility = require('./map-bss-ewcs-facility');
const isIssued = require('../../helpers/is-issued');
const MOCK_FACILIIES = require('../../__mocks__/mock-facilities');

describe('mappings - map submitted deal - mapBssEwcsFacility', () => {
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
      hasBeenAcknowledged,
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
      hasBeenIssued: isIssued(mockFacility),
      hasBeenAcknowledged,
      coverEndDate: expect.any(Object), // date object
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
