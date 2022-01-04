const { mapBssEwcsFacility } = require('./map-bss-ewcs-facility');

const mapBssEwcsDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const {
    _id,
    dealType,
    submissionType,
    bankInternalRefName,
    additionalRefName,
    details,
    submissionDetails,
    bondTransactions,
    loanTransactions,
    eligibility,
    exporter,
    status,
    maker,
  } = dealSnapshot;

  const {
    submissionCount,
    submissionDate,
    ukefDealId,
  } = details;

  const bonds = bondTransactions.items;
  const loans = loanTransactions.items;

  const mapped = {
    _id,
    dealType,
    submissionType,
    bankReferenceNumber: bankInternalRefName,
    bankAdditionalReferenceName: additionalRefName,
    submissionCount,
    submissionDate,
    status,
    ukefDealId,
    maker,
    exporter: {
      companyName: exporter.companyName,
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
