const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} = require('./deals');
const {
  allFacilities,
} = require('./facilities');

const { getPortalReports, getUnissuedFacilitiesReports } = require('./reports.controller');

module.exports = {
  allDeals,
  allFacilities,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  getPortalReports,
  getUnissuedFacilitiesReports,
};
