const { queryAllFacilities: queryFacilities } = require('../../v1/controllers/facilities.controller');

const { dbHelpers } = require('./helpers');

const queryAllFacilities = async (_, { params = {} }, ctx) => {
  const {
    start = 0,
    pagesize,
    filters = [],
    sort = [],
  } = params;

  const dbFilters = filters.map((clause) => {
    if (clause.operator) {
      return dbHelpers.createDbQuery(clause.operator, clause.field, clause.value);
    }

    return {
      [clause.field]: clause.value,
    };
  });

  let filtersObj = {};

  dbFilters.forEach((obj) => {
    filtersObj = {
      ...filtersObj,
      ...obj,
    };
  });

  const facilities = await queryFacilities(filtersObj, sort, start, pagesize);

  return facilities[0];
};

module.exports = queryAllFacilities;
