const { findFacilities } = require('../../v1/gef/controllers/facilities.controller');

const { dbHelpers } = require('./helpers');

const queryGefFacilities = async (_, { params = {} }, ctx) => {
  const { start = 0, pagesize, filters = [] } = params;

  const dbFilters = filters.map((clause) => ({
    [clause.field]: clause.operator ? dbHelpers.createDbQuery(clause.operator, clause.value) : clause.value,
  }));

  const facilities = await findFacilities(ctx.user, dbFilters, start, pagesize);

  return facilities[0];
};

module.exports = queryGefFacilities;
