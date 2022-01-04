const moment = require('moment');
const { STATUS, SUBMISSION_TYPE } = require('../constants');

const getUserFilters = (params, user = {}) => {
  const { filterBySubmissionUser } = params;

  if (filterBySubmissionUser === 'createdByMe') {
    return {
      field: 'maker.username',
      value: user.username,
    };
  }

  if (filterBySubmissionUser === 'createdByColleagues') {
    return {
      field: 'maker.username',
      value: user.username,
      operator: 'ne',
    };
    //    updated['maker.username'] = { $ne: user.username };
  }

  return false;
};

const buildDashboardFilters = (params, user) => {
  const filters = [];
  let isUsingAdvancedFilter = false;

  if (!params) {
    return {
      isUsingAdvancedFilter,
      filters,
    };
  }

  const userFilter = getUserFilters(params, user);
  if (userFilter) {
    filters.push(userFilter);
  }

  if (SUBMISSION_TYPE[params.filterBySubmissionType]) {
    filters.push(
      {
        field: 'submissionType',
        value: SUBMISSION_TYPE[params.filterBySubmissionType],
      },
    );
  }

  if (STATUS[params.filterByStatus]) {
    isUsingAdvancedFilter = true;
    filters.push(
      {
        field: 'status',
        value: STATUS[params.filterByStatus],
      },
    );
  }

  if (params.filterByShowAbandonedDeals === false || params.filterByShowAbandonedDeals === 'false') {
    filters.push({
      field: 'status',
      value: STATUS.abandoned,
      operator: 'ne',
    });
  }

  if (params.filterSearch) {
    isUsingAdvancedFilter = true;

    filters.push({
      field: 'freetextSearch',
      value: params.filterSearch,
    });
  }

  if (params['createdFrom-year']) {
    isUsingAdvancedFilter = true;

    const year = params['createdFrom-year'].padStart(4, '20');
    const month = params['createdFrom-month'].padStart(2, '0');
    const day = params['createdFrom-day'].padStart(2, '0');

    const createdFrom = moment(`${year} ${month} ${day}`, 'YYYY MM DD').valueOf();

    filters.push({
      field: 'details.created',
      value: `${createdFrom}`,
      operator: 'gte',
    });
  }

  if (params['createdTo-year']) {
    isUsingAdvancedFilter = true;

    const year = params['createdTo-year'].padStart(4, '20');
    const month = params['createdTo-month'].padStart(2, '0');
    const day = params['createdTo-day'].padStart(2, '0');

    const createdTo = moment(`${year} ${month} ${day}`, 'YYYY MM DD').add(1, 'day').valueOf();

    filters.push({
      field: 'details.created',
      value: `${createdTo}`,
      operator: 'lt',
    });
  }

  if (params.filterBySupplierName) {
    isUsingAdvancedFilter = true;
    filters.push({
      field: 'submissionDetails.supplier-name',
      value: params.filterBySupplierName,
    });
  }

  if (params.filterByBank) {
    isUsingAdvancedFilter = true;
    filters.push({
      field: 'bank.id',
      value: params.filterByBank,
    });
  }

  return {
    isUsingAdvancedFilter,
    filters,
  };
};

module.exports = buildDashboardFilters;
