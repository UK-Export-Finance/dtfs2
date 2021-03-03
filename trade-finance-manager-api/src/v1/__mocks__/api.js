const MOCK_DEAL = require('./mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('./mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('./mock-deal-no-companies-house');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('./mock-deal-facilities-USD-currency');
const MOCK_FACILITIES = require('./mock-facilities');
const MOCK_FACILITIES_USD_CURRENCY = require('./mock-facilities-USD-currency');
const MOCK_CURRENCY_EXCHANGE_RATE = require('./mock-currency-exchange-rate');

const ALL_MOCK_DEALS = [
  MOCK_DEAL,
  MOCK_DEAL_NO_PARTY_DB,
  MOCK_DEAL_NO_COMPANIES_HOUSE,
  MOCK_DEAL_FACILITIES_USD_CURRENCY,
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
      tfm: {},
    };

    return dealSnapshot ? Promise.resolve(deal) : Promise.reject();
  },
  findOnePortalDeal: (dealId) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  queryDeals: () => ALL_MOCK_DEALS,
  updateDeal: (dealId, updatedDeal) => {
    const deal = ALL_MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return {
      ...deal,
      ...updatedDeal,
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
      tfm: {},
    };
  },
  updateFacility: (facilityId, tfmUpdate) => {
    const facility = ALL_MOCK_FACILITIES.find((f) => f._id === facilityId); // eslint-disable-line no-underscore-dangle

    // for some reason 2 api tests act differently if tfmUpdate is *not* included in both
    // root object and in tfm object.
    return {
      ...facility,
      ...tfmUpdate,
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
  findUser: (username) => (
    username === 'invalidUser' ? false : { username }
  ),
  getCurrencyExchangeRate: () => ({
    midPrice: MOCK_CURRENCY_EXCHANGE_RATE,
  }),
};
