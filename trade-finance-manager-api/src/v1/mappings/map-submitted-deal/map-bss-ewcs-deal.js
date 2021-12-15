const { mapBssEwcsFacility } = require('./map-bss-ewcs-facility');

const mapBssEwcsDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const {
    _id,
    dealType,
    submissionType,
    details,
    submissionDetails,
    bondTransactions,
    loanTransactions,
    eligibility,
  } = dealSnapshot;

  const {
    bankSupplyContractID,
    bankSupplyContractName,
    submissionCount,
    submissionDate,
    status,
    ukefDealId,
    maker,
  } = details;

  const bonds = bondTransactions.items;
  const loans = loanTransactions.items;

  const mapped = {
    _id,
    dealType,
    submissionType,
    bankReferenceNumber: bankSupplyContractID,
    bankAdditionalReferenceName: bankSupplyContractName,
    submissionCount,
    submissionType,
    submissionDate,
    status,
    ukefDealId,
    maker,
    exporter: {
      companyName: submissionDetails['supplier-name'],
      companiesHouseRegistrationNumber: submissionDetails['supplier-companies-house-registration-number'],
    },
    buyer: {
      name: submissionDetails['buyer-name'],
      country: submissionDetails['buyer-address-country'],
    },
    indemnifier: {
      name: submissionDetails['indemnifier-name'],
    },
    dealCurrency: submissionDetails.supplyContractCurrency,
    dealValue: submissionDetails.supplyContractValue,
    destinationOfGoodsAndServices: submissionDetails.destinationOfGoodsAndServices,
    eligibility,
    facilities: [
      ...bonds.map((facility) => mapBssEwcsFacility(facility)),
      ...loans.map((facility) => mapBssEwcsFacility(facility)),
    ],
    tfm,
  };

  return mapped;
};

module.exports = mapBssEwcsDeal;
