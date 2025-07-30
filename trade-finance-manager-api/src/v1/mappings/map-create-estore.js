const { formatForSharePoint } = require('@ukef/dtfs2-common');
const { mapEstoreFiles } = require('./map-ukef-documents-to-estore');
const CONSTANTS = require('../../constants');

/**
 * Creates eStore API input object
 * @param {object} deal Deal object
 * @returns {object} Mapped eStore object
 */
const mapCreateEstore = (deal) => {
  // Destructure relevant properties
  const { ukefDealId, facilities, exporter, buyer, destinationOfGoodsAndServices, supportingInformation } = deal;

  /**
   * Set value as per deal type.
   * `buyer` can be undefined.
   */
  const buyerName = buyer?.name ? formatForSharePoint(buyer.name, ' ') : CONSTANTS.DEALS.DEAL_TYPE.GEF;
  const destinationMarket = destinationOfGoodsAndServices?.name ?? CONSTANTS.DEALS.DEFAULT_COUNTRY;
  const riskMarket = buyer?.country ? buyer.country.name : CONSTANTS.DEALS.DEFAULT_COUNTRY;
  // Uploaded documents
  let files = [];

  if (supportingInformation) {
    files = mapEstoreFiles(supportingInformation);
  }

  return {
    dealId: deal._id,
    dealIdentifier: ukefDealId,
    facilityIdentifiers: facilities.map((facility) => facility.ukefFacilityId),
    buyerName,
    exporterName: formatForSharePoint(exporter?.companyName, ' '),
    destinationMarket,
    riskMarket,
    supportingInformation: files,
  };
};

module.exports = mapCreateEstore;
