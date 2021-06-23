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

  return {
    count: mappedDeals.length,
    deals: mappedDeals,
  };
};

module.exports = dealsReducer;
