const { isSuperUser } = require('../../../helpers');

/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {string} createdByYou flag
 * @param {array} custom filters
 * @param {object} user
 * @example ( 'true', [ dealType: ['BSS/EWCS'] ], { _id: '123', firstName: 'Mock' } )
 * @returns [ { field: 'maker._id', value: ['123'] }, { field: dealType, value: ['BSS/EWCS'] } ]
 */
const dashboardFacilitiesDealFiltersQuery = (
  filters,
  user,
) => {
  const filtersQuery = [];

  if (!isSuperUser(user)) {
    filtersQuery.push({
      field: 'bank.id',
      value: user.bank.id,
      operator: 'and',
    });
  }

  return filtersQuery;
};

module.exports = {
  dashboardFacilitiesDealFiltersQuery,
};
