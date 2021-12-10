const api = require('../../api');
const generateHeadingText = require('../helpers');
const CONSTANTS = require('../../constants');

const getFacilities = async (req, res) => {
  const queryParams = { };

  const apiResponse = await api.getDeals(queryParams);

  if (apiResponse && apiResponse.deals) {
    return res.render('facilities/facilities.njk', {
      heading: 'All facilities',
      deals: apiResponse.deals,
      activePrimaryNavigation: 'all facilities',
      activeSubNavigation: 'facility',
      user: req.session.user,
    });
  }

  return res.redirect('/not-found');
};

const queryFacilities = async (req, res) => {
  let activeSortByOrder = CONSTANTS.DEALS.TFM_SORT_BY.ASCENDING;
  let activeSortByField = '';
  let searchString = '';

  if (req.body.search) {
    searchString = req.body.search;
  }

  const queryParams = { searchString };

  if (req.body.descending || req.body.ascending) {
    const sortBy = Object.getOwnPropertyNames(req.body)[0];
    const sortByField = req.body[sortBy];
    activeSortByField = sortByField;

    queryParams.sortBy = {
      field: sortByField,
      order: sortBy,
    };
  }

  const { deals, count } = await api.getDeals(queryParams);

  if (req.body.descending) {
    activeSortByOrder = CONSTANTS.DEALS.TFM_SORT_BY.DESCENDING;
  }

  return res.render('deals/deals.njk', {
    heading: generateHeadingText(count, searchString),
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
    activeSortByField,
    activeSortByOrder,
  });
};

module.exports = {
  getFacilities,
  queryFacilities,
};
