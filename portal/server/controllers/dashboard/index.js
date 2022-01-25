const {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} = require('./deals');
const {
  bssFacilities,
  gefFacilities,
} = require('./facilities');

const { getPortalReports, getUnissuedFacilitiesReport } = require('./reports.controller');

module.exports = {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
  bssFacilities,
  gefFacilities,
  getPortalReports,
  getUnissuedFacilitiesReport,
};
