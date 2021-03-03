const MOCK_DEAL = require('./mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('./mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('./mock-deal-no-companies-house');
const MOCK_FACILITY = require('./mock-facility');

const MOCK_DEALS = [
  MOCK_DEAL,
  MOCK_DEAL_NO_PARTY_DB,
  MOCK_DEAL_NO_COMPANIES_HOUSE,
];

module.exports = {
  findOneDeal: (dealId) => {
    const dealSnapshot = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    const deal = {
      _id: dealId,
      dealSnapshot,
      tfm: {},
    };

    return dealSnapshot ? Promise.resolve(deal) : Promise.reject();
  },
  findOnePortalDeal: (dealId) => {
    const deal = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  queryDeals: () => MOCK_DEALS,
  updateDeal: (dealId, updatedDeal) => {
    const deal = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return {
      ...deal,
      ...updatedDeal,
    };
  },
  submitDeal: (dealId) => ({
    _id: dealId,
    // eslint-disable-next-line no-underscore-dangle
    dealSnapshot: MOCK_DEALS.find((d) => d._id === dealId),
  }),
  findOneFacility: (facilityId) => ({
    _id: facilityId,
    facilitySnapshot: {
      ...MOCK_FACILITY,
      _id: facilityId,
    },
    tfm: {},
  }),
  updateFacility: (facilityId, tfmUpdate) => ({
    ...MOCK_FACILITY,
    ...tfmUpdate,
  }),
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
};
