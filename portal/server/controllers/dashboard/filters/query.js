const CONSTANTS = require('../../../constants');
const CONTENT_STRINGS = require('../../../content-strings');
const {
  getUserRoles,
  isSuperUser,
} = require('../../../helpers');

/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {string} createdByYou flag
 * @param {array} custom filters
 * @param {object} user
 * @example ( 'true', [ dealType: ['BSS/EWCS'] ], { _id: '123', firstName: 'Mock' } )
 * @returns [ { field: 'maker._id', value: ['123'] }, { field: dealType, value: ['BSS/EWCS'] } ]
 */
const dashboardFiltersQuery = (
  createdByYou,
  filters,
  user,
) => {
  const { isMaker, isChecker } = getUserRoles(user.roles);
  const filtersQuery = [];

  if (!isSuperUser(user)) {
    filtersQuery.push({
      field: 'bank.id',
      value: user.bank.id,
      operator: 'and',
    });
  }

  if (createdByYou) {
    filtersQuery.push({
      field: 'maker._id',
      value: user._id,
    });
  }

  if (isChecker && !isMaker) {
    filtersQuery.push({
      field: 'status',
      value: CONSTANTS.STATUS.READY_FOR_APPROVAL,
    });
  }

  filters.forEach((filterObj) => {
    const fieldName = Object.keys(filterObj)[0];
    const filterValue = filterObj[fieldName];

    if (!filterValue.includes(CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES)) {
      filtersQuery.push({
        field: fieldName,
        value: filterValue,
        operator: 'or',
      });
    }
  });


  return filtersQuery;
};

module.exports = {
  dashboardFiltersQuery,
};
