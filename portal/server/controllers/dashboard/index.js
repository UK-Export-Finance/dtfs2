const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} = require('./deals');
const {
  bssFacilities,
  gefFacilities,
} = require('./facilities');

const reportsController = require('./reports.controller');

module.exports = {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  bssFacilities,
  gefFacilities,
  reportsController,
};
