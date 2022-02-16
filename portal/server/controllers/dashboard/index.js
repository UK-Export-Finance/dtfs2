const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} = require('./deals');
const {
  allFacilities,
  removeSingleAllFacilitiesFilter,
  removeAllFacilitiesFilters,
} = require('./facilities');
const reportsController = require('./reports.controller');

module.exports = {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  allFacilities,
  removeSingleAllFacilitiesFilter,
  removeAllFacilitiesFilters,
  reportsController,
};
