const FACILITY_TYPE = {
  BOND: 'Bond',
  LOAN: 'Loan',
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
};

const TFM_SORT_BY = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

const TFM_SORT_BY_DEFAULT = {
  field: 'ukefFacilityId',
  order: TFM_SORT_BY.DESCENDING,
};

module.exports = {
  FACILITY_TYPE,
  TFM_SORT_BY,
  TFM_SORT_BY_DEFAULT,
  PAGE_SIZE: 20,
};
