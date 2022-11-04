const CONTENT_STRINGS = require('../../../content-strings');
const keywordQuery = require('./facilities-filters-keyword-query');

const { isSuperUser } = require('../../../helpers');

/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {object} user
 * @param {array} custom filters
 * @example ( { _id: '1234', bank: { id: '9' } }, [ type: ['Bond'] ] )
 * @returns { $and: [ { 'deal.bank.id': '9'} ], $or: [{ hasBeenIssued: true }, { type: 'Bond' } ] }
 */
const dashboardFacilitiesFiltersQuery = (
  filters,
  user,
) => {
  const query = {};
  let dashboardFilters = filters;

  // if user is admin, then deal.bank.id should not be set so cannot see all
  if (!isSuperUser(user)) {
    query.$and = [
      { 'deal.bank.id': user.bank.id },
    ];
  }

  const filtered = [];
  // removes _crsf from facilitiesFilter
  Object.values(dashboardFilters)
    .filter((v) => !v._csrf)
    .map((v) => filtered.push(v));

  dashboardFilters = filtered;

  if (dashboardFilters.length) {
    // if created, then copy else create blank array
    if (query.$and) {
      query.$and = [...query.$and];
    } else {
      query.$and = [];
    }

    dashboardFilters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      const isKeywordField = (fieldName === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD);

      if (isKeywordField) {
        const keywordValue = filterValue[0];
        const keywordFilters = keywordQuery(keywordValue);

        const keywordFilter = {};
        keywordFilter.$or = [];
        keywordFilter.$or.push(...keywordFilters);

        query.$and.push(keywordFilter);
      }

      if (!isKeywordField) {
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
  dashboardFacilitiesFiltersQuery,
};
