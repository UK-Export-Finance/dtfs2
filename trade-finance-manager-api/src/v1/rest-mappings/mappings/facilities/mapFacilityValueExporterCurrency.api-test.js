const { CURRENCY } = require('@ukef/dtfs2-common');
const mapFacilityValueExportCurrency = require('./mapFacilityValueExportCurrency');
const { AMENDMENT_STATUS } = require('../../../../constants/deals');

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

  it('should return the facilitySnapshot currency and value when no latest amendment', () => {
    const result = mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 1,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return the facilitySnapshot currency and value when latest amendment is not complete', () => {
    const result = mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 1,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return the new amendment value when latest amendment is complete', () => {
    mockFacility.amendments = [
      {
        status: AMENDMENT_STATUS.COMPLETED,
        tfm: {
          value: { ...mockAmendmentValueResponse },
        },
      },
    ];

    const result = mapFacilityValueExportCurrency(mockFacility);
    const expected = `${CURRENCY.GBP} 4,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return null when there is no facility provided', () => {
    const result = mapFacilityValueExportCurrency(null);
    expect(result).toBeNull();
  });
});
