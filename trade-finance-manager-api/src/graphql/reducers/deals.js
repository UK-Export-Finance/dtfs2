const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const getObjectPropertyValueFromStringPath = require('../../utils/get-object-property-value-from-string-path');
const CONSTANTS = require('../../constants');

const dealsReducer = (deals, sortBy) => {
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

  if (sortBy) {
    const sortedDeals = mappedDeals.sort((xDeal, yDeal) => {
      const xField = getObjectPropertyValueFromStringPath(xDeal, sortBy.field);
      const yField = getObjectPropertyValueFromStringPath(yDeal, sortBy.field);

      if (sortBy.order === CONSTANTS.DEALS.TFM_SORT_BY.ASCENDING) {
        if (xField > yField) {
          return 1;
        }

        if (yField > xField) {
          return -1;
        }
      }

      if (sortBy.order === CONSTANTS.DEALS.TFM_SORT_BY.DESCENDING) {
        if (xField > yField) {
          return -1;
        }

        if (yField > xField) {
          return 1;
        }
      }

      return 0;
    });

    const results = {
      count: sortedDeals.length,
      deals: sortedDeals,
    };

    return results;
  }

  return {
    count: mappedDeals.length,
    deals: mappedDeals,
  };
};

module.exports = dealsReducer;
