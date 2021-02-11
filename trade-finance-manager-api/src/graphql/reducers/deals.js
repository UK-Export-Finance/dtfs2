const mapSubmissionDetails = require('./mapSubmissionDetails');

// TODO: add unit test
// so that when this is changed, tests fail.

const dealsReducer = (dealsquery) => {
  const {
    count,
    deals,
  } = dealsquery;

  const mapDeal = (d) => {
    const deal = d;
    deal.submissionDetails = mapSubmissionDetails(d.submissionDetails);
    return deal;
  };

  const dealsMap = (ds) => {
    const mappedDeals = [];

    ds.forEach((d) => {
      mappedDeals.push(mapDeal(d));
    });

    return mappedDeals;
  };

  const {
    _id,
    //   details,
    //   submissionDetails,

  } = deals;

  // const {
  //   ukefDealId,
  //   status,
  //   submissionDate,
  //   submissionType,
  //   owningBank,
  //   bankSupplyContractID,
  //   bankSupplyContractName,
  //   maker,
  // } = details;

  // const {
  //   name,
  // } = owningBank;

  const results = {
    count,
    deals: dealsMap(deals),
    //       deals: {
    //         _id,
    //         details: {
    //           status,
    //           bankSupplyContractID,
    //           bankSupplyContractName,
    //           ukefDealId,
    //           submissionType,
    //           maker: {
    //             firstname: maker.firstname,
    //             surname: maker.surname,
    //             email: maker.email,
    //           },
    //           owningBank: {
    //             name,
    //           },
    //           submissionDate,
    //         },
    //         submissionDetails: mapSubmissionDetails(submissionDetails),
    //       },
  };
  return results;
};

module.exports = dealsReducer;
