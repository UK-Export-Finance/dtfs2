const CONSTANTS = require('../../constants');

const mapGefDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const mapped = {
    _id: dealSnapshot._id,
    dealType: dealSnapshot.dealType,
    bankSupplyContractID: dealSnapshot.bankInternalRefName,
    bankAdditionalReferenceName: dealSnapshot.additionalRefName,
    submissionCount: dealSnapshot.submissionCount,
    submissionType: dealSnapshot.submissionType,
    submissionDate: dealSnapshot.submissionDate,
    status: dealSnapshot.status,
    ukefDealId: dealSnapshot.ukefDealId,
    exporter: {
      companyName: dealSnapshot.exporter.companyName,
      companiesHouseRegistrationNumber: dealSnapshot.exporter.companiesHouseRegistrationNumber,
    },
    tfm,
  };

  return mapped;
};


const mapBssEwcsDeal = (deal) => {
  const { dealSnapshot, tfm } = deal;

  const mapped = {
    _id: dealSnapshot._id,
    dealType: dealSnapshot.dealType,
    bankReferenceNumber: dealSnapshot.details.bankSupplyContractID,
    bankAdditionalReferenceName: dealSnapshot.details.bankSupplyContractName,
    submissionCount: dealSnapshot.details.submissionCount,
    submissionType: dealSnapshot.details.submissionType,
    submissionDate: dealSnapshot.details.submissionDate,
    status: dealSnapshot.details.status,
    ukefDealId: dealSnapshot.details.ukefDealId,
    maker: dealSnapshot.details.maker,
    exporter: {
      companyName: dealSnapshot.submissionDetails['supplier-name'],
      companiesHouseRegistrationNumber: dealSnapshot.submissionDetails['supplier-companies-house-registration-number'],
    },
    buyer: {
      name: dealSnapshot.submissionDetails['buyer-name'],
      country: dealSnapshot.submissionDetails['buyer-address-country'],
    },
    indemnifier: {
      name: dealSnapshot.submissionDetails['indemnifier-name'],
    },
    dealCurrency: dealSnapshot.submissionDetails.supplyContractCurrency,
    dealValue: dealSnapshot.submissionDetails.supplyContractValue,
    destinationOfGoodsAndServices: dealSnapshot.submissionDetails.destinationOfGoodsAndServices,
    eligibility: dealSnapshot.eligibility,
    facilities: [
      ...dealSnapshot.bondTransactions.items.map((facility) => ({
        _id: facility._id,
        ukefFacilityID: facility.ukefFacilityID,
        facilityType: facility.facilityType,
        coverStartDate: facility.requestedCoverStartDate,
        'coverEndDate-day': facility['coverEndDate-day'],
        'coverEndDate-month': facility['coverEndDate-month'],
        'coverEndDate-year': facility['coverEndDate-year'],
        ukefGuaranteeInMonths: facility.ukefGuaranteeInMonths,
        facilityStage: facility.facilityStage,
        previousFacilityStage: facility.previousFacilityStage,
        currency: facility.currency,
        facilityValue: facility.facilityValue,
        coveredPercentage: facility.coveredPercentage,
        ukefExposure: facility.ukefExposure,
        disbursementAmount: facility.disbursementAmount,
        guaranteeFeePayableByBank: facility.guaranteeFeePayableByBank,
        dayCountBasis: facility.dayCountBasis,
        feeFrequency: facility.feeFrequency,
        feeType: facility.feeType,
        uniqueIdentificationNumber: facility.uniqueIdentificationNumber,
        tfm: facility.tfm,
      })),
      ...dealSnapshot.loanTransactions.items.map((facility) => ({
        _id: facility._id,
        ukefFacilityID: facility.ukefFacilityID,
        facilityType: facility.facilityType,
        coverStartDate: facility.requestedCoverStartDate,
        'coverEndDate-day': facility['coverEndDate-day'],
        'coverEndDate-month': facility['coverEndDate-month'],
        'coverEndDate-year': facility['coverEndDate-year'],
        ukefGuaranteeInMonths: facility.ukefGuaranteeInMonths,
        facilityStage: facility.facilityStage,
        previousFacilityStage: facility.previousFacilityStage,
        currency: facility.currency,
        facilityValue: facility.facilityValue,
        coveredPercentage: facility.coveredPercentage,
        ukefExposure: facility.ukefExposure,
        disbursementAmount: facility.disbursementAmount,
        guaranteeFeePayableByBank: facility.guaranteeFeePayableByBank,
        dayCountBasis: facility.dayCountBasis,
        feeFrequency: facility.feeFrequency,
        feeType: facility.feeType,
        uniqueIdentificationNumber: facility.uniqueIdentificationNumber,
        tfm: facility.tfm,
      })),
    ],
    tfm,
  };

  return mapped;
};

const mapSubmittedDeal = (deal) => {
  let mappedDeal;

  const { dealType } = deal.dealSnapshot;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    mappedDeal = mapGefDeal(deal);

    // temporarily return false for dev.
    return false;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    mappedDeal = mapBssEwcsDeal(deal);
  }

  return mappedDeal;
};

module.exports = {
  mapGefDeal,
  mapBssEwcsDeal,
  mapSubmittedDeal,
};
