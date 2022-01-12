const api = require('../../api');
const { dashboardFiltersQuery } = require('./filters/query');
const { dashboardFilters } = require('./filters/ui-filters');
const { selectedDashboardFilters } = require('./filters/ui-selected-filters');
const {
  submittedFiltersArray,
  submittedFiltersObject,
} = require('./filters/helpers');
const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} = require('../../helpers');
const CONSTANTS = require('../../constants');

const PAGESIZE = 20;
const primaryNav = 'home';
const tab = 'deals';

exports.allDeals = async (req, res) => {
  const { userToken } = requestParams(req);
  const { user } = req.session;

  if (Object.keys(req.body).length) {
    req.session.dashboardFilters = req.body;
  }

  const filtersArray = submittedFiltersArray(req.session.dashboardFilters);

  const filtersQuery = dashboardFiltersQuery(
    req.session.dashboardFilters.createdByYou,
    filtersArray,
    user,
  );

  const { count, deals } = await getApiData(api.allDeals(
    req.params.page * PAGESIZE,
    PAGESIZE,
    filtersQuery,
    userToken,
  ), res);

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  const filtersObj = submittedFiltersObject(filtersArray);

  return res.render('dashboard/deals.njk', {
    user,
    primaryNav,
    tab,
    deals,
    pages,
    filters: dashboardFilters(filtersObj),
    selectedFilters: selectedDashboardFilters(filtersObj),
    successMessage: getFlashSuccessMessage(req),
    createdByYou: req.session.dashboardFilters.createdByYou,
    keyword: req.session.dashboardFilters.keyword,
  });
};

exports.removeSingleAllDealsFilter = (req, res) => {
  delete req.session.dashboardFilters[req.params.fieldName];

  return res.redirect('/dashboard/deals/0');
};

exports.removeAllDealsFilters = (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD_FILTERS_DEFAULT;

  return res.redirect('/dashboard/deals/0');
};
