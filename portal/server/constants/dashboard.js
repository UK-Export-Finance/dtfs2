const SORT_BY = require('./sort');
const { PRIMARY_NAV_KEY } = require('./primary-nav-key');

const DASHBOARD = {
  PAGE_SIZE: 20,
  PRIMARY_NAV: PRIMARY_NAV_KEY.HOME,
  TABS: {
    DEALS: 'deals',
    FACILITIES: 'facilities',
  },
  DEFAULT_FILTERS: {
    keyword: null,
  },
  DEFAULT_SORT: {
    order: SORT_BY.DEFAULT,
  },
};

module.exports = DASHBOARD;
