const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');

const mapCreateEstore = (deal) => {
  const {
    ukefDealId,
    facilities,
    exporter,
    buyer,
    destinationOfGoodsAndServices,
  } = deal;

  return {
    exporterName: formatNameForSharepoint(exporter.companyName),
    buyerName: formatNameForSharepoint(buyer.name),
    dealIdentifier: ukefDealId,
    destinationMarket: destinationOfGoodsAndServices.name,
    riskMarket: buyer.country.name,
    facilityIdentifiers: facilities.map((facility) => facility.ukefFacilityID),
  };
};
module.exports = mapCreateEstore;
