const CONSTANTS = require('../../../constants');
const CONTENT_STRINGS = require('../../../content-strings');
const {
  getUserRoles,
  isSuperUser,
} = require('../../../helpers');

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

    filterObj[fieldName].forEach((filterValue) => {
      if (filterValue !== CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES) {
        if (fieldName === 'keyword') {
          filtersQuery.push({
            field: fieldName,
            value: filterValue,
            operator: 'or',
          });
        } else {
          filtersQuery.push({
            field: fieldName,
            value: filterValue,
          });
        }
      }
    });
  });

  return filtersQuery;
};

module.exports = {
  dashboardFiltersQuery,
};
