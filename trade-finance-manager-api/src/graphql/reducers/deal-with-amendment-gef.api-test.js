const { fromUnixTime, format } = require('date-fns');
const dealReducer = require('./deal');
const mapGefDeal = require('./mappings/gef-deal/mapGefDeal');
const { CURRENCY } = require('../../constants/currency.constant');

const MOCK_GEF_DEAL = require('../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../v1/__mocks__/mock-cash-contingent-facilities');

describe('gef deal with amendments', () => {
  const coverEndDateUnix = 1658403289;

  const mockAmendmentValueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
  };

  const mockAmendmentDateResponse = {
    coverEndDate: coverEndDateUnix,
    amendmentId: '1234',
  };

  it('should return original deal as amendment not fully complete', () => {
    const mockGefDeal = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: {
        ...MOCK_GEF_DEAL,
        facilities: [
          {
            facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
            tfm: {},
            amendments: [{ ...mockAmendmentValueResponse, ...mockAmendmentValueResponse }],
          },
        ],
      },
      tfm: {},
    };

    const result = dealReducer(mockGefDeal);

    const expected = mapGefDeal(mockGefDeal);

    expect(result).toEqual(expected);
  });

  it('should return updated deal with completed amendment with 2 changes', () => {
    const mockGefDeal = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: {
        ...MOCK_GEF_DEAL,
        facilities: [
          {
            facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
            tfm: {},
            amendments: [{ ...mockAmendmentValueResponse, ...mockAmendmentValueResponse }],
          },
        ],
      },
      tfm: {},
    };

    const originalResult = dealReducer(mockGefDeal);

    mockGefDeal.dealSnapshot.facilities[0].amendments[0].tfm = {
      value: { ...mockAmendmentValueResponse },
      ...mockAmendmentDateResponse,
      amendmentExposurePeriodInMonths: 12,
    };

    const amendmentResult = mapGefDeal(mockGefDeal);
    expect(amendmentResult).not.toEqual(originalResult);

    const amendedValue = `${CURRENCY.GBP} 5,000.00`;
    const amendedCoverEndDate = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');
    const amendedTenor = '12 months';

    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.value).toEqual(amendedValue);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate).toEqual(amendedCoverEndDate);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor).toEqual(amendedTenor);
  });

  it('should return updated deal with completed amendment with 1 changes if 1 accepted and 1 rejected', () => {
    const mockGefDeal = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: {
        ...MOCK_GEF_DEAL,
        facilities: [
          {
            facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
            tfm: {},
            amendments: [{ ...mockAmendmentValueResponse, ...mockAmendmentValueResponse }],
          },
        ],
      },
      tfm: {},
    };

    const originalResult = dealReducer(mockGefDeal);

    mockGefDeal.dealSnapshot.facilities[0].amendments[0].tfm = {
      value: { ...mockAmendmentValueResponse },
    };

    const amendmentResult = mapGefDeal(mockGefDeal);

    expect(amendmentResult).not.toEqual(originalResult);

    const amendedValue = `${CURRENCY.GBP} 5,000.00`;
    const amendedCoverEndDate = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');
    const amendedTenor = '12 months';

    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.value).toEqual(amendedValue);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate).not.toEqual(amendedCoverEndDate);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor).not.toEqual(amendedTenor);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate)
      .toEqual(originalResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor)
      .toEqual(originalResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor);
  });
});
