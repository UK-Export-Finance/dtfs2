const dealReducer = (deal) => {
  const {
    details,
    submissionDetails,
  } = deal;

  const {
    status,
    submissionDate,
    submissionType,
    owningBank,
  } = details;

  // TODO: maybe better to have flat structure, no submissionDetails / details
  // keep it simple/similar to regular source for now

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    details: {
      status,
      submissionDate,
      submissionType,
      owningBank: {
        name: owningBank.name,
        emails: owningBank.emails,
      },
    },

    submissionDetails: {
      supplierName: submissionDetails['supplier-name'],
      supplyContractCurrency: submissionDetails.supplyContractCurrency.id,
      supplyContractValue: submissionDetails.supplyContractValue,
      buyerName: submissionDetails['buyer-name'],
      supplyContractDescription: submissionDetails['supply-contract-description'],
      destinationCountry: submissionDetails.destinationOfGoodsAndServices
                          && submissionDetails.destinationOfGoodsAndServices.name,
    },
    eligibilityCriteria: deal.eligibility.criteria,
  };

  return result;
};

module.exports = dealReducer;
