const mapUkefExposure = require('./mapUkefExposure');
const { formattedNumber } = require('../../../../utils/number');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../../../constants/deals');
const { CURRENCY } = require('../../../../constants/currency');
const api = require('../../../../v1/api');

describe('mapUkefExposure()', () => {
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

  it('should return tfm.ukefExposure with timestamp', async () => {
    const mockFacilityTfm = {
      ukefExposure: '2,469.00',
      ukefExposureCalculationTimestamp: '1606900616651',
    };

    const mockFacility = {
      facilitySnapshot: {},
      tfm: mockFacilityTfm,
    };

    const result = await mapUkefExposure(mockFacilityTfm, mockFacility);

    const formattedUkefExposure = formattedNumber(mockFacilityTfm.ukefExposure);

    const expected = {
      exposure: `GBP ${formattedUkefExposure}`,
      timestamp: `${mockFacilityTfm.ukefExposureCalculationTimestamp}`,
    };

    expect(result).toEqual(expected);
  });

  it('should return tfm.ukefExposure with timestamp when amendment not completed', async () => {
    const mockFacilityTfm = {
      ukefExposure: '2,469.00',
      ukefExposureCalculationTimestamp: '1606900616651',
    };

    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const mockFacility = {
      _id: '12',
      facilitySnapshot: {},
      tfm: mockFacilityTfm,
    };

    const result = await mapUkefExposure(mockFacilityTfm, mockFacility);

    const formattedUkefExposure = formattedNumber(mockFacilityTfm.ukefExposure);

    const expected = {
      exposure: `GBP ${formattedUkefExposure}`,
      timestamp: `${mockFacilityTfm.ukefExposureCalculationTimestamp}`,
    };

    expect(result).toEqual(expected);
  });

  it('should return new exposure with timestamp when amendment completed', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

    const mockFacilityTfm = {
      ukefExposure: '2,469.00',
      ukefExposureCalculationTimestamp: '1606900616651',
    };

    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const mockFacility = {
      _id: '12',
      facilitySnapshot,
      tfm: mockFacilityTfm,
    };

    const result = await mapUkefExposure(mockFacilityTfm, mockFacility);

    const formattedUkefExposure = '600.00';

    const expected = {
      exposure: `GBP ${formattedUkefExposure}`,
      timestamp: expect.any(String),
    };

    expect(result).toEqual(expected);
  });

  it('should return empty object if no facilitytfm', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

    const mockFacilityTfm = null;

    const mockFacility = {
      _id: '12',
      facilitySnapshot,
      tfm: mockFacilityTfm,
    };

    const result = await mapUkefExposure(mockFacilityTfm, mockFacility);

    expect(result).toEqual({});
  });
});
