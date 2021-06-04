const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

// TODO: add unit test
// so that when this is changed, tests fail.
const dealReducer = (deal) => ({
  _id: deal._id, // eslint-disable-line no-underscore-dangle
  dealSnapshot: mapDealSnapshot(deal),
  tfm: mapDealTfm(deal),
});

module.exports = dealReducer;
