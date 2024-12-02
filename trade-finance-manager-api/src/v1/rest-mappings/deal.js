const CONSTANTS = require('../../constants');
const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefDeal = require('./mappings/gef-deal/mapGefDeal');

/**
 * Maps deals from the database to a deal object containing important and/or modified fields for use in TFM-UI and TFM-API.
 * @param {TfmDeal} deal
 * @returns {MappedDeal} The mapped deal to be used across TFM-UI and TFM-API.
 */
const dealReducer = (deal) => {
  if (deal.dealSnapshot.dealType && deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return mapGefDeal(deal);
  }

  return {
    _id: deal._id,
    dealSnapshot: mapDealSnapshot(deal),
    tfm: mapDealTfm(deal),
  };
};

module.exports = dealReducer;
