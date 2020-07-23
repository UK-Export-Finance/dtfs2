import moment from 'moment';
import CONSTANTS from '../constants';

// const buildDashboardFilters = (params, user) => {
const buildDashboardFilters = (params) => {
  const filters = [];
  let isUsingAdvancedFilter = false;

  if (!params) {
    return {
      isUsingAdvancedFilter,
      filters,
    };
  }

  if (CONSTANTS.TRANSACTION_STAGE[params.filterByTransactionStage]
    && CONSTANTS.TRANSACTION_STAGE[params.filterByTransactionStage] !== 'Any') {
    filters.push(
      {
        field: 'transaction.transactionStage',
        value: params.filterByTransactionStage,
      },
    );
  }

  if (CONSTANTS.TRANSACTION_TYPE[params.filterByTransactionType]
    && CONSTANTS.TRANSACTION_TYPE[params.filterByTransactionType] !== 'Any') {
    filters.push(
      {
        field: 'transaction.transactionType',
        value: params.filterByTransactionType,
      },
    );
  }

  if (params.bankFacilityID) {
    isUsingAdvancedFilter = true;
    filters.push(
      {
        field: 'transaction.bankFacilityId',
        value: params.bankFacilityID,
      },
    );
  }


  if (params.uKefFacilityID) {
    isUsingAdvancedFilter = true;
    filters.push(
      {
        field: 'transaction.ukefFacilityId',
        value: params.uKefFacilityID,
      },
    );
  }

  if (params['createdFrom-year']) {
    isUsingAdvancedFilter = true;

    const year = params['createdFrom-year'].padStart(4, '20');
    const month = params['createdFrom-month'].padStart(2, '0');
    const day = params['createdFrom-day'].padStart(2, '0');

    const createdFrom = moment(`${year} ${month} ${day}`, 'YYYY MM DD').valueOf();

    filters.push({
      field: 'transaction.deal_created',
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
      field: 'transaction.deal_created',
      value: `${createdTo}`,
      operator: 'lt',
    });
  }

  // if (params.filterByBank) {
  //   isUsingAdvancedFilter = true;
  //   filters.push({
  //     field: 'details.owningBank.id',
  //     value: params.filterByBank,
  //   });
  // }
  //

  return {
    isUsingAdvancedFilter,
    filters,
  };
};

export default buildDashboardFilters;
