/* eslint-disable no-underscore-dangle */
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

// TODO: add unit test
// so that when this is changed, tests fail.

const dealsReducer = (deals, _productDictionary) => {
  const mapDeal = (d) => {
    const deal = d;
    deal.dealSnapshot.submissionDetails = mapSubmissionDetails(d.dealSnapshot.submissionDetails);

    if (d._id in _productDictionary) {
      deal.Product = _productDictionary[d._id];
    }

    deal.tfm = {
      ...mapDealTfm(deal.tfm),

      // hard coded for now
      product: 'BSS & EWCS',
    };

    return deal;
  };

  const mapDeals = (ds) => {
    const mapped = [];

    ds.forEach((d) => {
      mapped.push(mapDeal(d));
    });

    return mapped;
  };

  const mappedDeals = mapDeals(deals);

  const sortedDeals = mappedDeals.sort((a, b) =>
    new Date(b.dealSnapshot.details.submissionDate)
    - new Date(a.dealSnapshot.details.submissionDate));

  const results = {
    count: sortedDeals.length,
    deals: sortedDeals,
  };

  return results;
};

module.exports = dealsReducer;
