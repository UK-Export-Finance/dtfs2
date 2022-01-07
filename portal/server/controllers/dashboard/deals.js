const api = require('../../api');
const { STATUS } = require('../../constants');
const { dashboardFilters } = require('./dashboardFilters');
const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
  isSuperUser,
} = require('../../helpers');

const PAGESIZE = 20;
const primaryNav = 'home';

const getRoles = (roles) => {
  const isMaker = roles.includes('maker');
  const isChecker = roles.includes('checker');

  return {
    isMaker,
    isChecker,
  };
};

const dashboardFiltersQuery = (filter, user) => {
  const { createdByYou } = filter;
  const { isMaker, isChecker } = getRoles(user.roles);
  const allFilters = [];

  if (!isSuperUser(user)) {
    allFilters.push({
      field: 'bank.id',
      value: user.bank.id,
    });
  }

  if (createdByYou) {
    allFilters.push({
      field: 'maker._id',
      value: user._id,
    });
  }

  if (isChecker && !isMaker) {
    allFilters.push({
      field: 'status',
      value: STATUS.READY_FOR_APPROVAL,
    });
  }

  return allFilters;
};

exports.allDeals = async (req, res) => {
  const tab = 'deals';
  const { userToken } = requestParams(req);

  const filtersQuery = dashboardFiltersQuery(req.body, req.session.user);

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

  return res.render('dashboard/deals.njk', {
    deals,
    pages,
    filters: dashboardFilters(),
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
    createdByYou: req.body.createdByYou,
  });
};
