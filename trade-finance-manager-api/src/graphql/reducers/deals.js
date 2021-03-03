/* eslint-disable no-underscore-dangle */
const mapSubmissionDetails = require('./mapSubmissionDetails');

// TODO: add unit test
// so that when this is changed, tests fail.

const dealsReducer = (dealsquery, _productDictionary) => {
  const {
    count,
    deals,
  } = dealsquery;

  const mapDeal = (d) => {
    const deal = d;
    deal.dealSnapshot.submissionDetails = mapSubmissionDetails(d.dealSnapshot.submissionDetails);

    if (d._id in _productDictionary) {
      deal.Product = _productDictionary[d._id];
    }

    // hard coded for now
    deal.tfm.product = 'BSS & EWCS';
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
