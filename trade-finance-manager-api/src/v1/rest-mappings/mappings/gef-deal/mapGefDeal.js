const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const mapDealTfm = require('../deal/dealTfm/mapDealTfm');

/**
 * Maps BSS/EWCS deal snapshot from the database to a deal snapshot containing important and/or modified fields for use in TFM-UI and TFM-API.
 * @param {TfmDeal} deal
 * @returns {MappedBssEwcsDealSnapshot} The mapped deal to be used across TFM-UI and TFM-API.
 */
const mapGefDeal = (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: mapGefDealSnapshot(deal.dealSnapshot, deal.tfm),
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

module.exports = mapGefDeal;
