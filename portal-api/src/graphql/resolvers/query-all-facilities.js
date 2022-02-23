const { queryAllFacilities: queryFacilities } = require('../../v1/controllers/facilities.controller');

const { dbHelpers } = require('./helpers');

const queryAllFacilities = async (_, { params = {} }) => {
  const {
    start = 0,
    pagesize,
    dealFilters = [],
    filters = [],
    sort = [],
  } = params;

  /*
   * create db query for deal filters
   */
  const dbDealFilters = dealFilters.map((clause) => {
    if (clause.operator) {
      return dbHelpers.createDbQuery(clause.operator, clause.field, clause.value);
    }

    return {
      [clause.field]: clause.value,
    };
  });

  let dealFiltersObj = {};

  dbDealFilters.forEach((obj) => {
    dealFiltersObj = {
      ...dealFiltersObj,
      ...obj,
    };
  });

  /*
   * create db query for facility filters
   */
  const dbFacilityFilters = filters.map((clause) => {
    if (clause.operator) {
      return dbHelpers.createDbQuery(clause.operator, clause.field, clause.value);
    }

    return {
      [clause.field]: clause.value,
    };
  });

  let facilityFiltersObj = {};

  dbFacilityFilters.forEach((obj) => {
    facilityFiltersObj = {
      ...facilityFiltersObj,
      ...obj,
    };
  });

  const facilities = await queryFacilities(
    dealFiltersObj,
    facilityFiltersObj,
    sort,
    start,
    pagesize,
  );

  if (!facilities.length) {
    return {
      facilities: [],
      count: 0,
    };
  }

  return facilities[0];
};

module.exports = queryAllFacilities;
