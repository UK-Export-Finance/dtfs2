const { findFacilities } = require('../../v1/gef/controllers/facilities.controller');

const { dbHelpers } = require('./helpers');

const queryAllFacilities = async (_, { params = {} }, ctx) => {
  console.log('API - queryAllFacilities....');
  const {
    start = 0,
    pagesize,
    filters = [],
    sort = [],
  } = params;

  console.log('API - queryAllFacilities....filters \n', filters);


  // const dbFilters = filters.map((clause) => ({
  //   [clause.field]: clause.operator ? dbHelpers.createDbQuery(clause.operator, clause.field, clause.value) : clause.value,
  // }));

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


  console.log('API - queryAllFacilities....dbFilters \n', dbFilters);

  const facilities = await findFacilities(filtersObj, sort, start, pagesize);

  console.log('API - queryAllFacilities....facilities \n', facilities);

  return facilities[0];
};

module.exports = queryAllFacilities;
