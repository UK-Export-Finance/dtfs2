const { getDealsOrFacilities, queryDealsOrFacilities } = require("../helpers");

const getDeals = (req, res) => getDealsOrFacilities('deals', req, res);
const queryDeals = (req, res) => queryDealsOrFacilities('deals', req, res);

module.exports = {
  getDeals,
  queryDeals,
};
