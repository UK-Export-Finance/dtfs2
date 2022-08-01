const mapFacilityValueExportCurrency = require('./mapFacilityValueExportCurrency');
const { CURRENCY } = require('../../../../constants/currency.constant');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../../../constants/deals');
const api = require('../../../../v1/api');

describe('mapFacilityValueExportCurrency()', () => {
  const mockFacility = {
    _id: '123',
    facilitySnapshot: {
      currency: {
        id: CURRENCY.GBP,
      },
      value: '1000',
    },
  };

  const mockAmendment = {
    amendmentId: '123',
    requireUkefApproval: true,
    value: 4000,
    currency: CURRENCY.GBP,
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
  };

  it('should return the facilitySnapshot currency and value when no latest amendment', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});

    const result = await mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 1,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return the facilitySnapshot currency and value when latest amendment is not complete', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const result = await mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 1,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return the new amendment value when latest amendment is complete', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };
    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const result = await mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 4,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return null when there is no facility provided', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});

    const result = await mapFacilityValueExportCurrency(null);
    expect(result).toBeNull();
  });
});
