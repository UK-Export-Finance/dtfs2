const SORT_BY = require('./sort');

const DASHBOARD = {
  PAGE_SIZE: 20,
  PRIMARY_NAV: 'home',
  TABS: {
    DEALS: 'deals',
    FACILITIES: 'facilities',
  },
  DEFAULT_FILTERS: {
    createdByYou: null,
    keyword: null,
  },
  DEFAULT_SORT: {
    order: SORT_BY.DEFAULT,
  },
};

module.exports = DASHBOARD;
