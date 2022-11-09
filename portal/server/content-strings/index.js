const DASHBOARD_FILTERS = {
  FILTER_HEADINGS: {
    CREATED: 'Created',
    KEYWORD: 'Keyword',
    PRODUCT: 'Product',
    NOTICE_TYPE: 'Notice Type',
    STATUS: 'Status',
    FACILITY_STAGE: 'Bank\'s facility stage',
  },
  // bespoke filter names and values that
  // do not exist in the data.
  BESPOKE_FIELD_NAMES: {
    KEYWORD: 'keyword',
  },
  BESPOKE_FILTER_VALUES: {
    DEALS: {
      ALL_STATUSES: 'All statuses',
      CREATED_BY_YOU: 'Created by you',
    },
    FACILITIES: {
      ISSUED: 'Issued',
      UNISSUED: 'Unissued',
      CREATED_BY_YOU: 'Created by you',
    },
  },
};

module.exports = {
  DASHBOARD_FILTERS,
};
