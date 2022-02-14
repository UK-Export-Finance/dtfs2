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
  const query = {
    $and: [
      { 'deal.bank.id': user.bank.id },
    ],
  };

  if (filters.length) {
    query.$or = [];

    filters.forEach((filterObj) => {
      const fieldName = Object.keys(filterObj)[0];
      const filterValue = filterObj[fieldName];

      filterValue.forEach((value) => {
        query.$or.push({
          [fieldName]: value,
        });
      });
    });
  }

  return query;
};

module.exports = {
  dashboardFacilitiesFiltersQuery,
};
