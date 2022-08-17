const mapUkefExposureValue = require('./mapUkefExposureValue');
const { formattedNumber } = require('../../../../utils/number');
const { CURRENCY } = require('../../../../constants/currency.constant');
const { AMENDMENT_UW_DECISION } = require('../../../../constants/deals');

describe('mapUkefExposureValue()', () => {
  const mockAmendmentValueResponse = {
    exposure: '600.00',
    timestamp: 1658403289,
  };

  const mockAmendment = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
    requireUkefApproval: true,
    ukefDecision: {
      submitted: true,
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
  };

  const facilitySnapshot = {
    coverPercentage: 12,
    _id: '1',
  };

  const mockFacilityTfm = {
    ukefExposure: '2,469.00',
    ukefExposureCalculationTimestamp: '1606900616651',
  };

  const mockFacility = {
    _id: '12',
    facilitySnapshot,
    tfm: mockFacilityTfm,
    amendments: [{ ...mockAmendment }],
  };

  it('should return exposure from facility if no amendment completed', () => {
    const result = mapUkefExposureValue(mockFacilityTfm, mockFacility);

    const expected = `${CURRENCY.GBP} ${formattedNumber(mockFacilityTfm.ukefExposure)}`;

    expect(result).toEqual(expected);
  });

  it('should return exposure from amendment if amendment completed', () => {
    mockFacility.amendments[0].tfm = {
      exposure: { ...mockAmendmentValueResponse },
    };
    const result = mapUkefExposureValue(mockFacilityTfm, mockFacility);

    const formattedUkefExposure = '600.00';

    const expected = `${CURRENCY.GBP} ${formattedUkefExposure}`;

    expect(result).toEqual(expected);
  });

  it('should return undefined if no facilityTfm', () => {
    const result = mapUkefExposureValue(null, mockFacility);

    expect(result).toEqual(undefined);
  });
});
