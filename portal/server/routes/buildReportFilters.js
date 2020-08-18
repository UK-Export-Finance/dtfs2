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

const buildReportFilters = (params, user) => {
  const filters = [];

  if (!params) {
    return filters;
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
    filters.push(
      {
        field: 'details.status',
        value: CONSTANTS.STATUS[params.filterByStatus],
      },
    );
  }

  if (CONSTANTS.FACILITY_STAGE[params.facilityStage]) {
    filters.push(
      {
        field: 'transaction.transactionStage',
        value: params.facilityStage,
      },
    );
  }

  if (params.bankSupplyContractID) {
    filters.push({
      field: 'details.bankSupplyContractID',
      value: params.bankSupplyContractID,
    });
  }

  if (params.ukefSupplyContractID) {
    filters.push({
      field: 'details.ukefDealId',
      value: params.ukefSupplyContractID,
    });
  }

  if (params.supplierName) {
    filters.push({
      field: 'details.supplierName',
      value: params.supplierName,
    });
  }

  if (params['createdFrom-year'] && params['createdFrom-month'] && params['createdFrom-day']) {
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

  if (params['createdTo-year'] && params['createdTo-month'] && params['createdTo-day']) {
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
    filters.push({
      field: 'submissionDetails.supplier-name',
      value: params.filterBySupplierName,
    });
  }

  if (params.filterByBank) {
    if (params.filterByBank !== 'any') {
      filters.push({
        field: 'details.owningBank.id',
        value: params.filterByBank,
      });
    }
  }
  if (params._id) { // eslint-disable-line no-underscore-dangle
    filters.push({
      field: '_id',
      value: params._id, // eslint-disable-line no-underscore-dangle
    });
  }

  return filters;
};

export default buildReportFilters;
