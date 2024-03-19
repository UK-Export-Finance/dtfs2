const { renderDealsOrFacilitiesPage, queryDealsOrFacilities } = require('../helpers');

const getFacilities = (req, res) => renderDealsOrFacilitiesPage('facilities', req, res);
const queryFacilities = (req, res) => queryDealsOrFacilities('facilities', req, res);

module.exports = {
  getFacilities,
  queryFacilities,
};
