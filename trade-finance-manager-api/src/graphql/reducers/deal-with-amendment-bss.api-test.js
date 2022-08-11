const { fromUnixTime, format } = require('date-fns');
const dealReducer = require('./deal');
const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const api = require('../../v1/api');
const { CURRENCY } = require('../../constants/currency.constant');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../constants/deals');

const MOCK_DEAL_AIN_SUBMITTED = require('../../v1/__mocks__/mock-deal-AIN-submitted');

describe('gef deal with amendments', () => {
  const coverEndDateUnix = 1658403289;

  const mockAmendment = {
    coverEndDate: coverEndDateUnix,
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
    requireUkefApproval: true,
    ukefDecision: {
      submitted: true,
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      coverEndDate: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
  };

  const mockAmendmentValueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
  };

  const mockAmendmentDateResponse = {
    coverEndDate: coverEndDateUnix,
    amendmentId: '1234',

  };

  it('should return original deal as amendment not fully complete', async () => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
    api.getLatestCompletedDateAmendment = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve({});

    const mockBSSDeal = {
      _id: MOCK_DEAL_AIN_SUBMITTED._id,
      dealSnapshot: {
        ...MOCK_DEAL_AIN_SUBMITTED,
        facilities: [
          {
            facilitySnapshot: MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0],
            tfm: {},
          },
        ],
      },
      tfm: {},
    };

    const result = await dealReducer(mockBSSDeal);

    const expected = {
      _id: mockBSSDeal._id,
      dealSnapshot: await mapDealSnapshot(mockBSSDeal),
      tfm: mapDealTfm(mockBSSDeal),
    };

    expect(result).toEqual(expected);
  });

  it('should return updated deal with completed amendment with 2 changes', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };
    MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0]['requestedCoverStartDate-year'] = '2022';
    MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0]['requestedCoverStartDate-month'] = '01';
    MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0]['requestedCoverStartDate-day'] = '01';

    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
    api.getLatestCompletedDateAmendment = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve({});

    const mockBSSDeal = {
      _id: MOCK_DEAL_AIN_SUBMITTED._id,
      dealSnapshot: {
        ...MOCK_DEAL_AIN_SUBMITTED,
        facilities: [
          {
            facilitySnapshot: MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0],
            tfm: {},
          },
        ],
      },
      tfm: {},
    };

    const originalResult = await dealReducer(mockBSSDeal);

    api.getLatestCompletedValueAmendment = () => Promise.resolve(mockAmendmentValueResponse);
    api.getLatestCompletedDateAmendment = () => Promise.resolve(mockAmendmentDateResponse);
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const amendmentResult = {
      _id: mockBSSDeal._id,
      dealSnapshot: await mapDealSnapshot(mockBSSDeal),
      tfm: mapDealTfm(mockBSSDeal),
    };

    expect(amendmentResult).not.toEqual(originalResult);

    const amendedValue = `${CURRENCY.GBP} 5,000.00`;
    const amendedCoverEndDate = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');
    const amendedTenor = '12 months';

    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.value).toEqual(amendedValue);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate).toEqual(amendedCoverEndDate);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor).toEqual(amendedTenor);
  });

  it('should return updated deal with completed amendment with 1 changes if 1 accepted and 1 rejected', async () => {
    MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0]['requestedCoverStartDate-year'] = '2022';
    MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0]['requestedCoverStartDate-month'] = '01';
    MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0]['requestedCoverStartDate-day'] = '01';
    mockAmendment.ukefDecision.coverEndDate = AMENDMENT_UW_DECISION.DECLINED;
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
    api.getLatestCompletedDateAmendment = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve({});

    const mockBSSDeal = {
      _id: MOCK_DEAL_AIN_SUBMITTED._id,
      dealSnapshot: {
        ...MOCK_DEAL_AIN_SUBMITTED,
        facilities: [
          {
            _id: '1',
            facilitySnapshot: MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0],
            tfm: {},
          },
        ],
      },
      tfm: {},
    };

    const originalResult = await dealReducer(mockBSSDeal);

    api.getLatestCompletedValueAmendment = () => Promise.resolve(mockAmendmentValueResponse);
    api.getLatestCompletedDateAmendment = () => Promise.resolve({});
    api.getAmendmentById = () => Promise.resolve(mockAmendment);

    const amendmentResult = {
      _id: mockBSSDeal._id,
      dealSnapshot: await mapDealSnapshot(mockBSSDeal),
      tfm: mapDealTfm(mockBSSDeal),
    };

    expect(amendmentResult).not.toEqual(originalResult);

    const amendedValue = `${CURRENCY.GBP} 5,000.00`;
    const amendedCoverEndDate = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');
    const amendedTenor = '6 months';

    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.value).toEqual(amendedValue);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate).not.toEqual(amendedCoverEndDate);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor).not.toEqual(amendedTenor);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate)
      .toEqual(originalResult.dealSnapshot.facilities[0].facilitySnapshot.dates.coverEndDate);
    expect(amendmentResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor)
      .toEqual(originalResult.dealSnapshot.facilities[0].facilitySnapshot.dates.tenor);
  });
});
