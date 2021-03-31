const MOCK_DEAL = require('./mock-deal');
const MOCK_DEAL_2 = require('./mock-deal-2');
const MOCK_DEAL_3 = require('./mock-deal-3');
const MOCK_DEAL_NO_PARTY_DB = require('./mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('./mock-deal-no-companies-house');
const MOCK_DEAL_NO_COMPANIES_HOUSE_2 = require('./mock-deal-no-companies-house-2');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('./mock-deal-facilities-USD-currency');
const MOCK_DEAL_FACILITIES_USD_CURRENCY_2 = require('./mock-deal-facilities-USD-currency-2');
const MOCK_DEAL_FACILITIES_USD_CURRENCY_3 = require('./mock-deal-facilities-USD-currency-3');
const MOCK_FACILITIES = require('./mock-facilities');
const MOCK_FACILITIES_USD_CURRENCY = require('./mock-facilities-USD-currency');
const MOCK_DEAL_MIN = require('./mock-deal-MIN');
const MOCK_DEAL_MIN_2 = require('./mock-deal-MIN-2');
const MOCK_DEAL_AIN_SUBMITTED = require('./mock-deal-AIN-submitted');
const MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE = require('./mock-deal-AIN-submitted-non-gbp-contract-value');
const MOCK_CURRENCY_EXCHANGE_RATE = require('./mock-currency-exchange-rate');
const MOCK_TASKS = require('./mock-tasks');
const MOCK_USERS = require('./mock-users');

const ALL_MOCK_DEALS = [
  MOCK_DEAL,
  MOCK_DEAL_2,
  MOCK_DEAL_3,
  MOCK_DEAL_NO_PARTY_DB,
  MOCK_DEAL_NO_COMPANIES_HOUSE,
  MOCK_DEAL_NO_COMPANIES_HOUSE_2,
  MOCK_DEAL_FACILITIES_USD_CURRENCY,
  MOCK_DEAL_FACILITIES_USD_CURRENCY_2,
  MOCK_DEAL_FACILITIES_USD_CURRENCY_3,
  MOCK_DEAL_MIN,
  MOCK_DEAL_MIN_2,
  MOCK_DEAL_AIN_SUBMITTED,
  MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE,
];

const ALL_MOCK_FACILITIES = [
  ...MOCK_FACILITIES,
  ...MOCK_FACILITIES_USD_CURRENCY,
];

module.exports = {
  findOneDeal: (dealId) => {
    const dealSnapshot = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    const deal = {
      _id: dealId,
      dealSnapshot,
      tfm: {
        tasks: MOCK_TASKS,
        exporterCreditRating: 'Good (BB-)',
        supplyContractValueInGBP: '7287.56740999854',
        parties: {
          exporter: {
            partyUrn: '1111',
          },
        },
        bondIssuerPartyUrn: '',
        bondBeneficiaryPartyUrn: '',
      },
    };

    return dealSnapshot ? Promise.resolve(deal) : Promise.reject();
  },
  findOnePortalDeal: (dealId) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  updatePortalDealStatus: (dealId, statusUpdate) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    const updatedDeal = {
      ...deal,
      details: {
        ...deal.details,
        status: statusUpdate,
        previousStatus: deal.details.previousStatus,
      },
    };
    return Promise.resolve(updatedDeal);
  },
  queryDeals: () => ALL_MOCK_DEALS,
  updateDeal: (dealId, updatedTfmDealData) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return {
      dealSnapshot: {
        ...deal,
      },
      ...updatedTfmDealData,
    };
  },
  submitDeal: (dealId) => ({
    _id: dealId,
    // eslint-disable-next-line no-underscore-dangle
    dealSnapshot: ALL_MOCK_DEALS.find((d) => d._id === dealId),
  }),
  findOneFacility: (facilityId) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle

    return {
      _id: facilityId,
      facilitySnapshot: {
        ...facility,
        _id: facilityId,
      },
      tfm: {
        ukefExposure: '1,234.00',
        ukefExposureCalculationTimestamp: '1606900616651',
        exposurePeriodInMonths: '12',
        facilityValueInGBP: '123,45.00',
        bondIssuerPartyUrn: '456-test',
        bondBeneficiaryPartyUrn: '123-test',
      },
    };
  },
  updateFacility: (facilityId, tfmUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle

    // for some reason 2 api tests act differently if tfmUpdate is *not* included in both
    // root object and in tfm object.
    return {
      _id: facilityId,
      facilitySnapshot: facility,
      tfmUpdate,
      tfm: {
        ...tfmUpdate,
      },
    };
  },
  getPartyDbInfo: ({ companyRegNo }) => (
    companyRegNo === 'NO_MATCH'
      ? false
      : [{
        partyUrn: 'testPartyUrn',
      }]
  ),
  findUser: (username) => {
    if (username === 'invalidUser') {
      return false;
    }

    return MOCK_USERS.find((user) => user.username === username);
  },
  findUserById: (userId) =>
    MOCK_USERS.find((user) => user._id === userId), // eslint-disable-line no-underscore-dangle
  updateUserTasks: (userId, updatedTasks) => {
    const user = MOCK_USERS.find((u) => u._id === userId); // eslint-disable-line no-underscore-dangle

    return {
      ...user,
      assignedTasks: updatedTasks,
    };
  },
  findTeamMembers: (teamId) =>
    MOCK_USERS.filter((user) => user.teams.includes(teamId)),
  getCurrencyExchangeRate: () => ({
    midPrice: MOCK_CURRENCY_EXCHANGE_RATE,
  }),
  createACBS: () => {},
};
