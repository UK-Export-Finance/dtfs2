const api = require('../../../api');
const { dashboardFacilitiesFiltersQuery } = require('./facilities-filters-query');
const { facilitiesTemplateFilters: templateFilters } = require('./template-filters');
const { selectedFilters } = require('./selected-filters');
const {
  submittedFiltersArray,
  submittedFiltersObject,
  filtersToText,
} = require('../filters/helpers');
const { removeSessionFilter } = require('../filters/remove-filter-from-session');
const { getApiData, requestParams, getFlashSuccessMessage } = require('../../../helpers');
const { sanitiseBody } = require('./sanitise-body');
const CONSTANTS = require('../../../constants');
const { isChecker } = require('../../../helpers/isChecker.helper');
const { dashboardSortQuery } = require('../sort/helpers');

const { PAGE_SIZE } = CONSTANTS.DASHBOARD;

const getAllFacilitiesData = async (userToken, user, sessionFilters, currentPage, sortBy, res) => {
  const filtersArray = submittedFiltersArray(sessionFilters);

  const filtersQuery = dashboardFacilitiesFiltersQuery(filtersArray, user);

  const sortQuery = dashboardSortQuery(sortBy);
  const { count, facilities } = await getApiData(api.allFacilities(currentPage * PAGE_SIZE, PAGE_SIZE, filtersQuery, userToken, sortQuery), res);

  return {
    facilities,
    count,
    filtersArray,
  };
};
exports.getAllFacilitiesData = getAllFacilitiesData;

const getTemplateVariables = (user, sessionFilters, facilities, count, currentPage, filtersArray) => {
  const pages = {
    totalPages: Math.ceil(count / PAGE_SIZE),
    currentPage: parseInt(currentPage, 10),
    totalItems: count,
  };

  const filtersObj = submittedFiltersObject(filtersArray);

  const templateVariables = {
    user,
    primaryNav: CONSTANTS.DASHBOARD.PRIMARY_NAV,
    tab: CONSTANTS.DASHBOARD.TABS.FACILITIES,
    facilities,
    pages,
    filters: templateFilters(filtersObj),
    selectedFilters: selectedFilters(filtersObj),
    keyword: sessionFilters.keyword,
    isChecker: isChecker(user.roles),
  };

  return templateVariables;
};
exports.getTemplateVariables = getTemplateVariables;

const getDataAndTemplateVariables = async (userToken, user, sessionFilters, currentPage, sortBy, res) => {
  const { facilities, count, filtersArray } = await getAllFacilitiesData(userToken, user, sessionFilters, currentPage, sortBy, res);

  const templateVariables = getTemplateVariables(user, sessionFilters, facilities, count, currentPage, filtersArray);

  return templateVariables;
};
exports.getDataAndTemplateVariables = getDataAndTemplateVariables;

exports.allFacilities = async (req, res) => {
  const { userToken } = requestParams(req);
  const { user } = req.session;
  const currentPage = req.params.page;

  let activeSortByOrder = req.session.sortBy ?? CONSTANTS.SORT_BY.DEFAULT;

  if (Object.keys(req.body).length) {
    const sanitisedBody = sanitiseBody(req.body);
    req.session.dashboardFilters = sanitisedBody;
    req.session.sortBy = req.body.sortBy ?? CONSTANTS.SORT_BY.DEFAULT;
  }

  if (req.body.sortBy) {
    if (req.body.sortBy === CONSTANTS.SORT_BY.DESCENDING) {
      activeSortByOrder = CONSTANTS.SORT_BY.DESCENDING;
      delete req.body.sortBy;
    }
    if (req.body.sortBy === CONSTANTS.SORT_BY.ASCENDING) {
      activeSortByOrder = CONSTANTS.SORT_BY.ASCENDING;
      delete req.body.sortBy;
    }
  }

  const templateVariables = await getDataAndTemplateVariables(userToken, user, req.session.dashboardFilters, currentPage, activeSortByOrder, res);

  return res.render('dashboard/facilities.njk', {
    ...templateVariables,
    successMessage: getFlashSuccessMessage(req),
    selectedFiltersString: filtersToText(templateVariables.selectedFilters),
    activeSortByOrder,
  });
};

exports.removeSingleAllFacilitiesFilter = async (req, res) => {
  removeSessionFilter(req);

  return res.redirect('/dashboard/facilities/0');
};

exports.removeAllFacilitiesFilters = (req, res) => {
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

  return res.redirect('/dashboard/facilities/0');
};
