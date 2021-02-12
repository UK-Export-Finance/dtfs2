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

  const results = {
    count,
    deals: dealsMap(deals),
  };
  return results;
};

module.exports = dealsReducer;
