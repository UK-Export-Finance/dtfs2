const SORT_BY = require('../../../constants/sort');

// sets if sort is ascending or descending or default (blank object)
const dashboardSortQuery = (sortParams) => {
  if (sortParams === SORT_BY.ASCENDING) {
    return { exporter: 1 };
  }

  if (sortParams === SORT_BY.DESCENDING) {
    return { exporter: -1 };
  }

  return {};
};

module.exports = { dashboardSortQuery };
