/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {object} user
 * @param {array} custom filters
 * @example ( { _id: '1234', bank: { id: '9' } }, [ type: ['Bond'] ] )
 * @returns [ { field: 'deal.bank._id', value: '9', operator: 'and' }, { field: 'type', value: ['Bond'], operator: 'or' } ]
 */
const dashboardFacilitiesFiltersQuery = (
  filters,
  user,
) => {
  const filtersQuery = [];

  filtersQuery.push({
    field: 'deal.bank.id',
    value: user.bank.id,
    operator: 'and',
  });

  filters.forEach((filterObj) => {
    const fieldName = Object.keys(filterObj)[0];
    const filterValue = filterObj[fieldName];

    filtersQuery.push({
      field: fieldName,
      value: filterValue,
      operator: 'or',
    });
  });

  return filtersQuery;
};

module.exports = {
  dashboardFacilitiesFiltersQuery,
};
