const DASHBOARD_FILTERS = {
  FILTER_HEADINGS: {
    KEYWORD: 'Keyword',
    PRODUCT: 'Product',
    NOTICE_TYPE: 'Notice Type',
    STATUS: 'Status',
    FACILITY_STAGE: 'Bank\'s facility stage',
  },
  // bespoke filter values are values that
  // do not exist in the data.
  BESPOKE_FILTER_VALUES: {
    DEALS: {
      ALL_STATUSES: 'All statuses',
    },
    FACILITIES: {
      ISSUED: 'Issued',
      UNISSUED: 'Unissued',
    },
  },
};

module.exports = {
  DASHBOARD_FILTERS,
};
