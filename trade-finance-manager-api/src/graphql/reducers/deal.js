const dealReducer = (deal) => {
  const { submissionDetails } = deal;

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    details: deal.details,

    // TODO maybe better to have flat structure, no submissionDetails / details
    // keep it simple/similar to regular source for now
    submissionDetails: {
      supplierName: submissionDetails['supplier-name'],
      supplyContractDescription: submissionDetails['supply-contract-description'],
      destinationCountry: submissionDetails.destinationOfGoodsAndServices.name,
    },
  };

  return result;
};

module.exports = dealReducer;
