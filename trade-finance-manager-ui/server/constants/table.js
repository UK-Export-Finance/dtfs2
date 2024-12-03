const SORT_BY = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
  DEFAULT: {
    DEALS: {
      field: 'tfm.dateReceivedTimestamp',
      order: 'descending',
    },
    FACILITIES: {
      field: 'ukefFacilityId',
      order: 'ascending',
    },
  },
};

module.exports = {
  SORT_BY,
  PAGE_SIZE: 20,
};
