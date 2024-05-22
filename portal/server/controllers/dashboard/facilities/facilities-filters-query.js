const CONTENT_STRINGS = require('../../../content-strings');
const keywordQuery = require('./facilities-filters-keyword-query');

const { isSuperUser } = require('../../../helpers');

/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {object} user
 * @param {array} custom filters
 * @example ( { _id: '1234', bank: { id: '9' } }, [ type: ['Bond'] ] )
 * @returns { AND: [ { 'deal.bank.id': '9'} ], OR: [{ hasBeenIssued: true }, { type: 'Bond' } ] }
 */
const dashboardFacilitiesFiltersQuery = (filters, user) => {
  const query = {};
  let dashboardFilters = filters;

  // if user is admin, then deal.bank.id should not be set so cannot see all
  if (!isSuperUser(user)) {
    query.AND = [{ 'deal.bank.id': user.bank.id }];
  }

  const filtered = [];
  // removes _crsf from facilitiesFilter
  Object.values(dashboardFilters)
    .filter((v) => !v._csrf)
    .map((v) => filtered.push(v));

  dashboardFilters = filtered;

  if (dashboardFilters.length) {
    // if created, then copy else create blank array
    if (query.AND) {
      query.AND = [...query.AND];
    } else {
      query.AND = [];
    }

    dashboardFilters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      const isKeywordField = fieldName === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD;

      if (isKeywordField) {
        const keywordValue = filterValue[0];
        const keywordFilters = keywordQuery(keywordValue);

        const keywordFilter = {};
        keywordFilter.OR = [];
        keywordFilter.OR.push(...keywordFilters);

        query.AND.push(keywordFilter);
      }

      if (!isKeywordField) {
        const fieldFilter = {};
        // or for field (eg dealType)
        fieldFilter.OR = [];
        filterValue.forEach((value) => {
          // if created by you then adding user id as compared to or statement
          if (value === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.CREATED_BY_YOU) {
            // delete or filter as not needed for created by you
            delete fieldFilter.OR;
            // have to match deal.maker._id (joined table) as maker does not exist in facilities collection
            fieldFilter['deal.maker._id'] = user._id;
          } else {
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
  dashboardFacilitiesFiltersQuery,
};
