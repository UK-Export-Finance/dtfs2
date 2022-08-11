const mapFacilityValueExportCurrency = require('./mapFacilityValueExportCurrency');
const { CURRENCY } = require('../../../../constants/currency.constant');
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

  const mockAmendmentValueResponse = {
    amendmentId: '123',
    value: 4000,
    currency: CURRENCY.GBP,
  };

  it('should return the facilitySnapshot currency and value when no latest amendment', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});

    const result = await mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 1,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return the facilitySnapshot currency and value when latest amendment is not complete', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});

    const result = await mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 1,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return the new amendment value when latest amendment is complete', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve(mockAmendmentValueResponse);

    const result = await mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 4,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return null when there is no facility provided', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});

    const result = await mapFacilityValueExportCurrency(null);
    expect(result).toBeNull();
  });
});
