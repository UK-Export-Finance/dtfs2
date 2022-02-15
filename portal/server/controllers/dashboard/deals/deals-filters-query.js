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
 * @returns { $and: [ { 'bank.id': '9'} ], $or: [{ dealType: 'BSS/EWCS' }] }
 */
const dashboardDealsFiltersQuery = (
  createdByYou,
  filters,
  user,
) => {
  const { isMaker, isChecker } = getUserRoles(user.roles);

  const query = {};

  if (!isSuperUser(user)) {
    query.$and = [
      { 'bank.id': user.bank.id },
    ];
  }

  if (createdByYou) {
    query.$and.push({
      'maker._id': user._id,
    });
  }

  if (isChecker && !isMaker) {
    query.$and.push({
      [CONSTANTS.FIELD_NAMES.DEAL.STATUS]: CONSTANTS.STATUS.READY_FOR_APPROVAL,
    });
  }

  if (filters.length) {
    // Do NOT create $or array if the only passed filter is 'all statuses'.
    // This filter value does require anything to be added to the query.
    // Therefore, we don't want to create an empty $or array. Otherwise the query will fail.

    const statusFilterObj = filters.find((obj) => obj[CONSTANTS.FIELD_NAMES.DEAL.STATUS]);
    const statusFilterValues = (statusFilterObj && statusFilterObj[CONSTANTS.FIELD_NAMES.DEAL.STATUS]);

    const hasOnlyStatusFilter = (statusFilterValues?.length === 1 && statusFilterValues);
    const hasOnlyAllStatusesFilterValue = (hasOnlyStatusFilter
        && statusFilterValues[0] === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES);

    if (!hasOnlyAllStatusesFilterValue) {
      query.$or = [];
    }

    filters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      const isKeywordField = (fieldName === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD);

      const hasAllStatusesFilterValue = filterValue.includes(CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES);

      if (isKeywordField) {
        const keywordValue = filterValue[0];

        const keywordFilters = [
          {
            [CONSTANTS.FIELD_NAMES.DEAL.BANK_INTERNAL_REF_NAME]: {
              $regex: keywordValue, $options: 'i',
            },
          },
          {
            [CONSTANTS.FIELD_NAMES.DEAL.STATUS]: {
              $regex: keywordValue, $options: 'i',
            },
          },
          {
            [CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE]: {
              $regex: keywordValue, $options: 'i',
            },
          },
          {
            [CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE]: {
              $regex: keywordValue, $options: 'i',
            },
          },
          {
            [CONSTANTS.FIELD_NAMES.DEAL.EXPORTER_COMPANY_NAME]: {
              $regex: keywordValue, $options: 'i',
            },
          },
        ];

        query.$or = [
          ...query.$or,
          ...keywordFilters,
        ];
      }

      if (!isKeywordField && !hasAllStatusesFilterValue) {
        filterValue.forEach((value) => {
          query.$or.push({
            [fieldName]: value,
          });
        });
      }
    });
  }

  return query;
};

module.exports = {
  dashboardDealsFiltersQuery,
};
