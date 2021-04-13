const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

// TODO: improve unit test coverage

const dealsReducer = (deals) => {
  const mapDeal = (d) => {
    const deal = d;
    deal.dealSnapshot.submissionDetails = mapSubmissionDetails(d.dealSnapshot.submissionDetails);

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

  const sortedDeals = mappedDeals.sort((x, y) => {
    const xDate = Number(x.dealSnapshot.details.submissionDate);
    const yDate = Number(y.dealSnapshot.details.submissionDate);

    if (xDate > yDate) {
      return -1;
    }

    if (yDate > xDate) {
      return 1;
    }

    return 0;
  });

  const results = {
    count: sortedDeals.length,
    deals: sortedDeals,
  };

  return results;
};

module.exports = dealsReducer;
