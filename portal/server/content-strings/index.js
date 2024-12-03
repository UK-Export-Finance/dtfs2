/**
 * These are the the strings displayed on the dashboard filter
 * The `BESPOKE_FIELD_NAMES` do not exist in the database & are mapped into different queries
 * The `BESPOKE_FILTER_VALUES similarly do not exist in the database & are mapped into different queries
 */
const DASHBOARD_FILTERS = {
  FILTER_HEADINGS: {
    // empty string for created as does not have heading - necessary to keep
    CREATED: '',
    KEYWORD: 'Keyword',
    PRODUCT: 'Product',
    NOTICE_TYPE: 'Notice Type',
    STATUS: 'Status',
    FACILITY_STAGE: "Bank's facility stage",
  },
  BESPOKE_FIELD_NAMES: {
    KEYWORD: 'keyword',
    STAGE: 'stage',
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
