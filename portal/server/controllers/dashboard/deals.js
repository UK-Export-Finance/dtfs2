const api = require('../../api');

const { PRODUCT } = require('../../constants');

const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
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

const dashboardFilters = (filter, userId) => {
  const allFilters = [];

  const { createdByYou } = filter;

  if (createdByYou) {
    allFilters.push({
      field: 'userId',
      value: userId,
    });
  }
  return allFilters;
};

exports.bssDeals = async (req, res) => {
  const tab = 'bssDeals';
  const { userToken } = requestParams(req);
  const { isMaker, isChecker } = getRoles(req.session.user.roles);

  let filters = [];
  filters = dashboardFilters(req.body, req.session.user._id);

  if (isChecker && !isMaker) {
    filters.push({
      field: 'status',
      value: "Ready for Checker's approval",
    });
  }

  // eslint-disable-next-line max-len
  const { count, deals } = await getApiData(api.allDeals(req.params.page * PAGESIZE, PAGESIZE, filters, userToken), res);

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('dashboard/deals.njk', {
    deals,
    pages,
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
    createdByYou: req.body.createdByYou,
  });
};

exports.gefDeals = async (req, res) => {
  const tab = 'gefDeals';
  const { userToken } = requestParams(req);
  const { isMaker, isChecker } = getRoles(req.session.user.roles);

  let filters = [];
  filters = dashboardFilters(req.body, req.session.user._id);

  if (isChecker && !isMaker) {
    filters.push({
      field: 'status',
      value: 'BANK_CHECK',
    });
  }

  const { count, deals: rawDeals } = await getApiData(
    api.gefDeals(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );
  const deals = rawDeals.map((deal) => ({
    _id: deal._id,
    status: deal.status,
    bankRef: deal.bankInternalRefName,
    exporter: deal.exporter?.companyName,
    product: PRODUCT.GEF,
    type: deal.submissionType,
    lastUpdate: deal.updatedAt || deal.createdAt,
  }))
    .sort((a, b) => b.lastUpdate - a.lastUpdate);

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };
  return res.render('dashboard/deals.njk', {
    deals,
    pages,
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
    createdByYou: req.body.createdByYou,
  });
};
