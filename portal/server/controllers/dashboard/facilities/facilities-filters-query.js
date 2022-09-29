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
  // removes _crsf from dashboardFilters
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(dashboardFilters)) {
    if (!Object.prototype.hasOwnProperty.call(value, '_csrf')) {
      filtered.push(value);
    }
  }
  dashboardFilters = filtered;

  if (dashboardFilters.length) {
    query.$or = [];

    dashboardFilters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      const isKeywordField = (fieldName === CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD);

      if (isKeywordField) {
        const keywordValue = filterValue[0];
        const keywordFilters = keywordQuery(keywordValue);

        query.$or = [
          ...query.$or,
          ...keywordFilters,
        ];
      }

      if (!isKeywordField) {
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
  dashboardFacilitiesFiltersQuery,
};
