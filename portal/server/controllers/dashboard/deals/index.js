const api = require('../../../api');
const { dashboardDealsFiltersQuery } = require('./deals-filters-query');
const { dealsTemplateFilters: templateFilters } = require('./template-filters');
const { selectedFilters } = require('./selected-filters');
const {
  submittedFiltersArray,
  submittedFiltersObject,
} = require('../filters/helpers');
const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} = require('../../../helpers');
const CONSTANTS = require('../../../constants');

const PAGESIZE = 20;
const primaryNav = 'home';
const tab = 'deals';

const getAllDealsData = async (
  userToken,
  user,
  sessionFilters,
  currentPage,
  res,
) => {
  const filtersArray = submittedFiltersArray(sessionFilters);

  const filtersQuery = dashboardDealsFiltersQuery(
    sessionFilters.createdByYou,
    filtersArray,
    user,
  );

  const { count, deals } = await getApiData(api.allDeals(
    currentPage * PAGESIZE,
    PAGESIZE,
    filtersQuery,
    userToken,
  ), res);

  return {
    deals,
    count,
    filtersArray,
  };
};
exports.getAllDealsData = getAllDealsData;

const getTemplateVariables = (
  user,
  sessionFilters,
  deals,
  count,
  currentPage,
  filtersArray,
) => {
  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(currentPage, 10),
    totalItems: count,
  };

  const filtersObj = submittedFiltersObject(filtersArray);

  const templateVariables = {
    user,
    primaryNav,
    tab,
    deals,
    pages,
    filters: templateFilters(filtersObj),
    selectedFilters: selectedFilters(filtersObj),
    createdByYou: sessionFilters.createdByYou,
    keyword: sessionFilters.keyword,
  };

  return templateVariables;
};
exports.getTemplateVariables = getTemplateVariables;

const getDataAndTemplateVariables = async (
  userToken,
  user,
  sessionFilters,
  currentPage,
  res,
) => {
  const { deals, count, filtersArray } = await getAllDealsData(
    userToken,
    user,
    sessionFilters,
    currentPage,
    res,
  );

  const templateVariables = getTemplateVariables(
    user,
    sessionFilters,
    deals,
    count,
    currentPage,
    filtersArray,
  );

  return templateVariables;
};
exports.getDataAndTemplateVariables = getDataAndTemplateVariables;

exports.allDeals = async (req, res) => {
  const { userToken } = requestParams(req);
  const { user } = req.session;
  const currentPage = req.params.page;


  if (Object.keys(req.body).length) {
    req.session.dashboardFilters = req.body;
  }

  const templateVariables = await getDataAndTemplateVariables(
    userToken,
    user,
    req.session.dashboardFilters,
    currentPage,
    res,
  );

  return res.render('dashboard/deals.njk', {
    ...templateVariables,
    successMessage: getFlashSuccessMessage(req),
  });
};

exports.removeSingleAllDealsFilter = async (req, res) => {
  const currentFilters = req.session.dashboardFilters;

  const filter = currentFilters[req.params.fieldName];

  if (filter) {
    if (Array.isArray(filter)) {
      const modifiedFilter = currentFilters[req.params.fieldName].filter((value) =>
        value !== req.params.fieldValue);

      req.session.dashboardFilters[req.params.fieldName] = modifiedFilter;
    } else {
      delete req.session.dashboardFilters[req.params.fieldName];
    }
  }

  return res.redirect('/dashboard/deals/0');
};

exports.removeAllDealsFilters = (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD_FILTERS_DEFAULT;

  return res.redirect('/dashboard/deals/0');
};
