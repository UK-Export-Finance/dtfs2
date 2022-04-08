const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');
const CONSTANTS = require('../../constants');
const { mapUKEFDocumentsToEstore } = require('./map-ukef-documents-to-estore');

const mapCreateEstore = (deal) => {
  const {
    dealType,
    ukefDealId,
    facilities,
    exporter,
    buyer,
    destinationOfGoodsAndServices,
    supportingInformation,
  } = deal;

  let buyerName;
  let destinationMarket;
  let riskMarket;
  let files = [];

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    // default values for GEF. GEF does not have this data.
    buyerName = CONSTANTS.DEALS.DEAL_TYPE.GEF;
    destinationMarket = 'United Kingdom';
    riskMarket = 'United Kingdom';
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    buyerName = formatNameForSharepoint(buyer.name);
    destinationMarket = destinationOfGoodsAndServices.name;
    riskMarket = buyer.country.name;
  }

  if (supportingInformation) {
    files = mapUKEFDocumentsToEstore(supportingInformation);
  }

  return {
    dealId: deal._id,
    dealType,
    exporterName: (exporter && exporter.companyName) ? exporter.companyName : '',
    buyerName,
    dealIdentifier: ukefDealId,
    destinationMarket,
    riskMarket,
    facilityIdentifiers: facilities.map((facility) => facility.ukefFacilityId),
    supportingInformation: files,
  };
};
module.exports = mapCreateEstore;
