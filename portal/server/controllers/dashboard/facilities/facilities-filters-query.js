/**
 * Generates an array of objects to be sent to API (for DB query)
 *
 * @param {object} user
 * @param {array} custom filters
 * @example ( { _id: '1234', bank: { id: '9' } }, [ dealType: ['BSS/EWCS'] ] )
 * @returns [ { field: 'deal.bank._id', value: '9', operator: 'and' }, { field: dealType, value: ['BSS/EWCS'], operator: 'or' } ]
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
    let filterValue = filterObj[fieldName];

    // console.log('---- filterValue ', filterValue);
    // console.log('---- typeof filterValue ', typeof filterValue);
    // if (filterValue === 'true' || filterValue === 'false') {
    //   filterValue = Boolean(filterValue);
    // }

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
