const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');
const CONSTANTS = require('../../constants');

const mapCreateEstore = (deal) => {
  const {
    dealType,
    ukefDealId,
    facilities,
    exporter,
    buyer,
    destinationOfGoodsAndServices,
  } = deal;

  let buyerName;
  let destinationMarket;
  let riskMarket;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    // default values for GEF. GEF does not this data.
    buyerName = CONSTANTS.DEALS.DEAL_TYPE.GEF;
    destinationMarket = 'United Kingdom';
    riskMarket = 'United Kingdom';
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    buyerName = formatNameForSharepoint(buyer.name);
    destinationMarket = destinationOfGoodsAndServices.name;
    riskMarket = buyer.country.name;
  }

  return {
    exporterName: formatNameForSharepoint(exporter.companyName),
    buyerName,
    dealIdentifier: ukefDealId,
    destinationMarket,
    riskMarket,
    facilityIdentifiers: facilities.map((facility) => facility.ukefFacilityID),
  };
};
module.exports = mapCreateEstore;
