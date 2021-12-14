const api = require('../../api');
const generateHeadingText = require('../helpers');
const CONSTANTS = require('../../constants');

const getFacilities = async (req, res) => {
  const apiResponse = await api.getFacilities();

  if (apiResponse) {
    return res.render('facilities/facilities.njk', {
      heading: 'All facilities',
      facilities: apiResponse.facilities,
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

  return res.render('facilities/facilities.njk', {
    heading: generateHeadingText(count, searchString),
    deals,
    activePrimaryNavigation: 'all facilities',
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
