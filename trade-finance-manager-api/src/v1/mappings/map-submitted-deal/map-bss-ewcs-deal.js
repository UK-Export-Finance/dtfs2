const { mapBssEwcsFacility } = require('./map-bss-ewcs-facility');

/**
 * Maps a submitted BSS/EWCS deal object to a formatted deal structure.
 *
 * @param {object} deal - The deal object containing dealSnapshot and tfm data.
 * @param {object} deal.dealSnapshot - Snapshot of the deal details.
 * @param {object} deal.tfm - TFM (Trade Finance Manager) related data.
 * @returns {object} The mapped deal object with formatted fields including exporter, buyer, indemnifier, facilities, and supporting information.
 */
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
    supportingInformation,
  } = dealSnapshot;

  const { submissionCount, submissionDate, ukefDealId } = details;

  const bonds = bondTransactions.items;
  const loans = loanTransactions.items;

  const { companyName } = exporter;

  const mapped = {
    _id,
    dealType,
    submissionType,
    bankInternalRefName,
    additionalRefName,
    submissionCount,
    submissionDate,
    status,
    ukefDealId,
    maker,
    smeType: submissionDetails['sme-type'],
    exporter: {
      companyName,
      companiesHouseRegistrationNumber: submissionDetails['supplier-companies-house-registration-number'],
      registeredAddress: {
        addressLine1: submissionDetails['supplier-address-line-1'],
        addressLine2: submissionDetails['supplier-address-line-2'],
        locality: submissionDetails['supplier-address-town'],
        postalCode: submissionDetails['supplier-address-postcode'],
        country: submissionDetails['supplier-address-country'].name,
      },
      selectedIndustry: {
        name: submissionDetails['industry-sector'].name,
        class: submissionDetails['industry-class'].name,
        code: submissionDetails['industry-class'].code,
      },
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
    supportingInformation,
    facilities: [...bonds.map((facility) => mapBssEwcsFacility(facility)), ...loans.map((facility) => mapBssEwcsFacility(facility))],
    tfm,
  };

  return mapped;
};

module.exports = mapBssEwcsDeal;
