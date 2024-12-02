const mapSupplyContractValueInGBP = require('./mapSupplyContractValueInGBP');

/**
 * Maps the tfm object from the database to a tfm object containing important and/or modified fields for use in TFM-UI and TFM-API.
 * @param {TfmDeal} deal
 * @returns {MappedDealTfm} The mapped tfm object to be used across TFM-UI and TFM-API.
 */
const mapDealTfm = (deal) => {
  const { tfm: dealTfm } = deal;

  if (!dealTfm) {
    return null;
  }

  const { supplyContractValueInGBP } = dealTfm;

  const result = {
    ...dealTfm,
    supplyContractValueInGBP: mapSupplyContractValueInGBP(supplyContractValueInGBP),
  };

  return result;
};

module.exports = mapDealTfm;
