const { queryAllFacilities: queryFacilities } = require('../../v1/controllers/facilities.controller');

const { dbHelpers } = require('./helpers');

const queryAllFacilities = async (_, { params = {} }) => {
  const {
    start = 0,
    pagesize,
    filters = [],
    sort = [],
  } = params;

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
