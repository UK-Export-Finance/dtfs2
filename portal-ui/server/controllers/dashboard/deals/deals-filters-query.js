const { CHECKERS_AMENDMENTS_DEAL_ID, isPortalFacilityAmendmentsFeatureFlagEnabled, DEAL_STATUS } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../../constants');
const CONTENT_STRINGS = require('../../../content-strings');
const { getUserRoles, isSuperUser, getCheckersApprovalAmendmentDealIds } = require('../../../helpers');
const keywordQuery = require('./deals-filters-keyword-query');

/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {Array} custom filters
 * @param {object} user
 * @param {string} userToken
 * @example ([ dealType: ['BSS/EWCS'] ], { _id: '123', firstName: 'Mock' }, 'token') )
 * @returns { AND: [ { 'bank.id': '9'} ], OR: [{ dealType: 'BSS/EWCS' }, dealIdsWithAmendmentsInProgress: [{dealId: 'dealId1'}]] }
 */
const dashboardDealsFiltersQuery = async (filters, user, userToken) => {
  const { isMaker, isChecker } = getUserRoles(user.roles);
  let dashboardFilters = filters;

  const query = {};

  if (!isSuperUser(user)) {
    query.AND = [{ 'bank.id': user.bank.id }];
  }

  if (isChecker && !isMaker) {
    const isFeatureFlagEnabled = isPortalFacilityAmendmentsFeatureFlagEnabled();
    const orQuery = { OR: [{ [CONSTANTS.FIELD_NAMES.DEAL.STATUS]: CONSTANTS.STATUS.DEAL.READY_FOR_APPROVAL }] };

    /**
     * Feature flag validation for Checker's portal screen.
     * Portal amendment endpoint will be invoked upon checker login and therefore,
     * it should only be invoked if Portal amendment feature flag is truthy.
     */
    if (isFeatureFlagEnabled) {
      const checkersApprovalAmendmentDealIds = await getCheckersApprovalAmendmentDealIds(userToken);

      if (checkersApprovalAmendmentDealIds?.length) {
        /**
         * Add an `and` query to the `orQuery`
         * If any amendment status is `READY_FOR_CHECKERS_APPROVAL`,
         * AND the deal status is `UKEF_ACKNOWLEDGED`, then it will show on the dashboard for checker.
         * The deals with following deal statues will not appear to the checker:
         * - `CANCELLED`
         * - `PENDING_CANCELLATION`
         */
        const andQuery = {
          AND: [{ [CHECKERS_AMENDMENTS_DEAL_ID]: checkersApprovalAmendmentDealIds }, { [CONSTANTS.FIELD_NAMES.DEAL.STATUS]: DEAL_STATUS.UKEF_ACKNOWLEDGED }],
        };

        orQuery.OR.push(andQuery);
      }
    }

    query.AND.push(orQuery);
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
    // Do NOT create OR array if the only passed filter is 'all statuses'.
    // This filter value does require anything to be added to the query.
    // Therefore, we don't want to create an empty OR array. Otherwise the query will fail.

    const statusFilterObj = dashboardFilters.find((obj) => obj[CONSTANTS.FIELD_NAMES.DEAL.STATUS]);
    const statusFilterValues = statusFilterObj && statusFilterObj[CONSTANTS.FIELD_NAMES.DEAL.STATUS];

    const hasOnlyStatusFilter = statusFilterValues?.length === 1 && statusFilterValues;
    const hasOnlyAllStatusesFilterValue =
      hasOnlyStatusFilter && statusFilterValues[0] === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES;

    if (!hasOnlyAllStatusesFilterValue && !query.AND) {
      // empty and query if not created yet
      query.AND = [];
    }

    dashboardFilters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      const isKeywordField = fieldName === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD;

      const hasAllStatusesFilterValue = filterValue.includes(CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES);

      /**
       * overall filtering logic is AND
       * however keyword is constructed by matching all fields to keyword
       * if and logic will not work as cannot match all field so has to be or for keyword search
       * so or array is pushed to overall AND query
       */
      if (isKeywordField) {
        const keywordValue = filterValue[0];
        const keywordFilters = keywordQuery(keywordValue);

        const keywordFilter = {};
        keywordFilter.OR = [];
        keywordFilter.OR.push(...keywordFilters);

        query.AND.push(keywordFilter);
      }

      /**
       * overall filtering logic is AND
       * however for each fieldFilter (eg dealType) should be OR
       * example for filter dealType: GEF and BSS
       * if AND logic, will fail as no deals are both GEF and BSS so need or logic
       * AND: [
       *    { OR: [{dealType: 'GEF}, {dealType: 'BSS'}] },
       *    {status: 'Draft'},
       * ]
       * if created by you filter, follows different logic so if else statement to check
       */
      if (!isKeywordField && !hasAllStatusesFilterValue) {
        const fieldFilter = {};
        // or for field (eg dealType)
        fieldFilter.OR = [];
        filterValue.forEach((value) => {
          // if created by you then adding user id as compared to or statement
          if (value === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.CREATED_BY_YOU) {
            // delete or filter as not needed for created by you
            delete fieldFilter.OR;
            fieldFilter['maker._id'] = user._id;
          } else {
            // else for all other filters apart from createdByYou
            fieldFilter.OR.push({
              [fieldName]: value,
            });
          }
        });
        // adds OR to AND query
        query.AND.push(fieldFilter);
      }
    });
  }

  return query;
};

module.exports = {
  dashboardDealsFiltersQuery,
};
