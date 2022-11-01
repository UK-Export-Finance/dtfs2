const CONSTANTS = require('../../../constants');
const CONTENT_STRINGS = require('../../../content-strings');
const { getUserRoles, isSuperUser } = require('../../../helpers');
const keywordQuery = require('./deals-filters-keyword-query');

/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {string} createdByYou flag
 * @param {array} custom filters
 * @param {object} user
 * @example ( 'true', [ dealType: ['BSS/EWCS'] ], { _id: '123', firstName: 'Mock' } )
 * @returns { $and: [ { 'bank.id': '9'} ], $or: [{ dealType: 'BSS/EWCS' }] }
 */
const dashboardDealsFiltersQuery = (createdByYou, filters, user) => {
  const { isMaker, isChecker } = getUserRoles(user.roles);
  let dashboardFilters = filters;

  const query = {};

  if (!isSuperUser(user)) {
    query.$and = [{ 'bank.id': user.bank.id }];
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
  const filtered = [];
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(dashboardFilters)) {
    if (!Object.prototype.hasOwnProperty.call(value, '_csrf')) {
      filtered.push(value);
    }
  }
  dashboardFilters = filtered;

  if (dashboardFilters.length) {
    // Do NOT create $or array if the only passed filter is 'all statuses'.
    // This filter value does require anything to be added to the query.
    // Therefore, we don't want to create an empty $or array. Otherwise the query will fail.

    const statusFilterObj = dashboardFilters.find((obj) => obj[CONSTANTS.FIELD_NAMES.DEAL.STATUS]);
    const statusFilterValues = statusFilterObj && statusFilterObj[CONSTANTS.FIELD_NAMES.DEAL.STATUS];

    const hasOnlyStatusFilter = statusFilterValues?.length === 1 && statusFilterValues;
    const hasOnlyAllStatusesFilterValue = (hasOnlyStatusFilter
      && statusFilterValues[0] === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES);

    if (!hasOnlyAllStatusesFilterValue && !query.$and) {
      // empty and query if not created yet
      query.$and = [];
    }

    dashboardFilters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      const isKeywordField = fieldName === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD;

      const hasAllStatusesFilterValue = filterValue.includes(CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES);

      /**
       * overall filtering logic is $and
       * however keyword is contructed by matching all fields to keyword
       * if and logic will not work as cannot match all field so has to be or for keyword search
       * so or array is pushed to overall $and query
       */
      if (isKeywordField) {
        const keywordValue = filterValue[0];
        const keywordFilters = keywordQuery(keywordValue);

        const keywordFilter = {};
        keywordFilter.$or = [];
        keywordFilter.$or.push(...keywordFilters);

        query.$and.push(keywordFilter);
      }

      /**
       * overall filtering logic is $and
       * however for each fieldFilter (eg dealType) should be $or
       * example for filter dealType: GEF and BSS
       * if $and logic, will fail as no deals are both GEF and BSS so need or logic
       * $and: [
       *    { $or: [{dealType: 'GEF}, {dealType: 'BSS'}] },
       *    {status: 'Draft'},
       * ]
       */
      if (!isKeywordField && !hasAllStatusesFilterValue) {
        const fieldFilter = {};
        // or for field (eg dealType)
        fieldFilter.$or = [];
        filterValue.forEach((value) => {
          fieldFilter.$or.push({
            [fieldName]: value,
          });
        });
        // adds $or to $and query
        query.$and.push(fieldFilter);
      }
    });
  }

  return query;
};

module.exports = {
  dashboardDealsFiltersQuery,
};
