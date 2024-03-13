const { getDealsOrFacilities, queryDealsOrFacilities } = require('../helpers');

const getFacilities = (req, res) => getDealsOrFacilities('facilities', req, res);
const queryFacilities = (req, res) => queryDealsOrFacilities('facilities', req, res);

module.exports = {
  getFacilities,
  queryFacilities,
};
