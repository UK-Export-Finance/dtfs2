const mapUkefExposureValue = require('./mapUkefExposureValue');
const { formattedNumber } = require('../../../../utils/number');
const { CURRENCY } = require('../../../../constants/currency.constant');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../../../constants/deals');
const api = require('../../../../v1/api');

describe('mapUkefExposureValue()', () => {
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

  const mockAmendmentValueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
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
  };

  it('should return exposure from facility if no amendment completed', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve({});

    const result = await mapUkefExposureValue(mockFacilityTfm, mockFacility);

    const expected = `${CURRENCY.GBP} ${formattedNumber(mockFacilityTfm.ukefExposure)}`;

    expect(result).toEqual(expected);
  });

  it('should return exposure from facility if no amendment completed', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve({});

    const result = await mapUkefExposureValue(mockFacilityTfm, mockFacility);

    const expected = `${CURRENCY.GBP} ${formattedNumber(mockFacilityTfm.ukefExposure)}`;

    expect(result).toEqual(expected);
  });

  it('should return exposure from amendment if amendment completed', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

    api.getLatestCompletedValueAmendment = () => Promise.resolve(mockAmendmentValueResponse);
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const result = await mapUkefExposureValue(mockFacilityTfm, mockFacility);

    const formattedUkefExposure = '600.00';

    const expected = `${CURRENCY.GBP} ${formattedUkefExposure}`;

    expect(result).toEqual(expected);
  });

  it('should return undefined if no facilityTfm', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve(mockAmendmentValueResponse);

    const result = await mapUkefExposureValue(null, mockFacility);

    expect(result).toEqual(undefined);
  });
});
