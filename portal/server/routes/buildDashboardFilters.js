import moment from 'moment';
import CONSTANTS from '../constants';

const getUserFilters = (params, user = {}) => {
  const { filterBySubmissionUser } = params;

  if (filterBySubmissionUser === 'createdByMe') {
    return {
      field: 'details.maker.username',
      value: user.username,
    };
  }

  if (filterBySubmissionUser === 'createdByColleagues') {
    return {
      field: 'details.maker.username',
      value: user.username,
      operator: 'ne',
    };
    //    updated['details.maker.username'] = { $ne: user.username };
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

  //  if (params.filterBySubmissionUser) filters = applyUserFilters(params, user, filters);
  if (CONSTANTS.SUBMISSION_TYPE[params.filterBySubmissionType]) {
    filters.push(
      {
        field: 'details.submissionType',
        value: CONSTANTS.SUBMISSION_TYPE[params.filterBySubmissionType],
      },
    );
  }

  if (CONSTANTS.STATUS[params.filterByStatus]) {
    isUsingAdvancedFilter = true;
    filters.push(
      {
        field: 'details.status',
        value: CONSTANTS.STATUS[params.filterByStatus],
      },
    );
  }

  if (params.filterBySupplyContractID) {
    isUsingAdvancedFilter = true;
    filters.push({
      field: 'details.bankSupplyContractID',
      value: params.filterBySupplyContractID,
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
      field: 'details.owningBank.id',
      value: params.filterByBank,
    });
  }

  console.log(`${JSON.stringify(filters)}`);
  return {
    isUsingAdvancedFilter,
    filters,
  };
};

export default buildDashboardFilters;
