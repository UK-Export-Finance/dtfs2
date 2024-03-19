const { renderDealsOrFacilitiesPage, queryDealsOrFacilities } = require('../helpers');

const getDeals = (req, res) => renderDealsOrFacilitiesPage('deals', req, res);
const queryDeals = (req, res) => queryDealsOrFacilities('deals', req, res);

module.exports = {
  getDeals,
  queryDeals,
};
