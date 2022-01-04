const moment = require('moment');
const { FACILITY_STAGE, STATUS, SUBMISSION_TYPE } = require('../constants');

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
  if (SUBMISSION_TYPE[params.filterBySubmissionType]) {
    filters.push(
      {
        field: 'submissionType',
        value: SUBMISSION_TYPE[params.filterBySubmissionType],
      },
    );
  }

  if (STATUS[params.filterByStatus]) {
    filters.push(
      {
        field: 'status',
        value: STATUS[params.filterByStatus],
      },
    );
  }

  if (FACILITY_STAGE[params.facilityStage]) {
    /*
    const stage = FACILITY_STAGE[params.facilityStage];
    let filterValue = (stage === FACILITY_STAGE.unissued ||
      stage === FACILITY_STAGE.conditional ? 'unissued_conditional' : 'issued_unconditional');
    if (stage === FACILITY_STAGE.incomplete) filterValue = stage;
    if (stage === FACILITY_STAGE.submitted) filterValue = stage;
     */
    filters.push(
      {
        field: 'transaction.transactionStage',
        value: params.facilityStage,
      },
    );
  }

  if (params.bankInternalRefName) {
    filters.push({
      field: 'bankInternalRefName',
      value: params.bankInternalRefName,
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

  if (params['submittedFrom-year'] && params['submittedFrom-month'] && params['submittedFrom-day']) {
    const year = params['submittedFrom-year'].padStart(4, '20');
    const month = params['submittedFrom-month'].padStart(2, '0');
    const day = params['submittedFrom-day'].padStart(2, '0');

    const submittedFrom = moment(`${year} ${month} ${day}`, 'YYYY MM DD').valueOf();

    filters.push({
      field: 'details.submissionDate',
      value: `${submittedFrom}`,
      operator: 'gte',
    });
  }

  if (params['submittedTo-year'] && params['submittedTo-month'] && params['submittedTo-day']) {
    const year = params['submittedTo-year'].padStart(4, '20');
    const month = params['submittedTo-month'].padStart(2, '0');
    const day = params['submittedTo-day'].padStart(2, '0');

    const submittedTo = moment(`${year} ${month} ${day}`, 'YYYY MM DD').add(1, 'day').valueOf();

    filters.push({
      field: 'details.submissionDate',
      value: `${submittedTo}`,
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
        field: 'bank.id',
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

module.exports = buildReportFilters;
