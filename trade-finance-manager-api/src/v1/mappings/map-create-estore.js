const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');

const mapCreateEstore = (deal) => {
  const { dealSnapshot } = deal;

  const facilities = [
    ...dealSnapshot.bondTransactions.items,
    ...dealSnapshot.loanTransactions.items,
  ];

  return {
    exporterName: formatNameForSharepoint(dealSnapshot.submissionDetails['supplier-name']),
    buyerName: formatNameForSharepoint(dealSnapshot.submissionDetails['buyer-name']),
    dealIdentifier: dealSnapshot.details.ukefDealId,
    destinationMarket: dealSnapshot.submissionDetails.destinationOfGoodsAndServices.name,
    riskMarket: dealSnapshot.submissionDetails['buyer-address-country'].name,
    facilityIdentifiers: facilities.map((facility) => facility.facilitySnapshot.ukefFacilityID),
  };
};
module.exports = mapCreateEstore;
