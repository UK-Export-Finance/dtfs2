const { findAllPaginatedDeals, findAllDeals } = require('../../v1/controllers/deal.controller');
const { dbHelpers } = require('./helpers');
const dealsReducer = require('../reducers/deals');

const queryAllDeals = async (_, { params = {} }, ctx) => {
  const {
    start = 0,
    pagesize,
    filters = [],
    sort = [],
  } = params;

  const dbFilters = filters.map((clause) => {
    if (clause.field === 'keyword') {
      return dbHelpers.createDbQueryKeywordDeals(clause.value[0]);
    }

    if (clause.operator) {
      return dbHelpers.createDbQuery(clause.operator, clause.field, clause.value);
    }

    return {
      [clause.field]: clause.value,
    };
  });

  let dealFiltersObj = {};

  dbFilters.forEach((obj) => {
    dealFiltersObj = {
      ...dealFiltersObj,
      ...obj,
    };
  });

  const deals = pagesize
    ? await findAllPaginatedDeals(ctx.user, dealFiltersObj, sort, start, pagesize)
    : await findAllDeals(ctx.user, dealFiltersObj, sort);

  if (!deals.length) {
    return {
      deals: [],
      count: 0,
    };
  }

  const dealsObj = deals[0];

  const {
    deals: dealsArray,
    count,
  } = dealsObj;

  const reducedDeals = dealsReducer(dealsArray);

  return {
    deals: reducedDeals,
    count,
  };
};

module.exports = queryAllDeals;
