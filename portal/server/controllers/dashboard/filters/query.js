const { isSuperUser } = require('../../../helpers');

const getRoles = (roles) => {
  const isMaker = roles.includes('maker');
  const isChecker = roles.includes('checker');

  return {
    isMaker,
    isChecker,
  };
};

const dashboardFiltersQuery = (
  createdByYou,
  filters,
  user,
) => {
  const { isMaker, isChecker } = getRoles(user.roles);
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
      value: STATUS.READY_FOR_APPROVAL,
    });
  }

  filters.forEach((filterObj) => {
    const fieldName = Object.keys(filterObj)[0];

    filterObj[fieldName].forEach((filterValue) => {
      filtersQuery.push({
        field: fieldName,
        value: filterValue,
      });
    });
  });

  return filtersQuery;
};

module.exports = dashboardFiltersQuery;
