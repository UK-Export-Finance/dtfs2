const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

const dealsReducer = (deals) => {
  const mapDeal = (deal) => {
    // manually merge facilities into facilities array.
    // this saves performance.
    // without this, we'd need to do a query for every facility in a deal,
    // for every single deal in the 'all deals' query.

    const dealWithMappedFacilities = {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      dealSnapshot: {
        ...deal.dealSnapshot,
        facilities: [
          ...deal.dealSnapshot.bondTransactions.items,
          ...deal.dealSnapshot.loanTransactions.items,
        ],
      },
      tfm: deal.tfm,
    };

    const mapped = {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      dealSnapshot: {
        ...deal.dealSnapshot,
        submissionDetails: mapSubmissionDetails(deal.dealSnapshot.submissionDetails),
      },
      tfm: mapDealTfm(dealWithMappedFacilities),
    };

    return mapped;
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
