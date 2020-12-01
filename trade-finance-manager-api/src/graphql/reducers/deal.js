const dealReducer = (deal) => {
  const { submissionDetails } = deal;

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    details: deal.details,

    // TODO maybe better to have flat structure, no submissionDetails / details
    // keep it simple/similar to regular source for now
    submissionDetails: {
      supplierName: submissionDetails['supplier-name'],
      supplyContractCurrency: submissionDetails.supplyContractCurrency.id,
      supplyContractValue: submissionDetails.supplyContractValue,
      buyerName: submissionDetails['buyer-name'],
      supplyContractDescription: submissionDetails['supply-contract-description'],
      destinationCountry: submissionDetails.destinationOfGoodsAndServices
                          && submissionDetails.destinationOfGoodsAndServices.name,
    },
  };

  return result;
};

module.exports = dealReducer;
