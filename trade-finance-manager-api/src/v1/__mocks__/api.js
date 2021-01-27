const MOCK_DEAL = require('./mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('./mock-deal-no-party-db');
const MOCK_FACILITY = require('./mock-facility');

const MOCK_DEALS = [
  MOCK_DEAL,
  MOCK_DEAL_NO_PARTY_DB,
];

module.exports = {
  findOneDeal: (dealId) => {
    const deal = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return deal ? Promise.resolve(deal) : Promise.reject();
  },
  findOneFacility: () => MOCK_FACILITY,
  queryDeals: () => MOCK_DEALS,
  updateDeal: (dealId, updatedDeal) => {
    const deal = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return {
      ...deal,
      ...updatedDeal,
    };
  },
  getPartyDbInfo: ({ companyRegNo }) => (
    companyRegNo === 'NO_MATCH'
      ? false
      : [{
        partyUrn: 'testPartyUrn',
      }]
  ),
};
