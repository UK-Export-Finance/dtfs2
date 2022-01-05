const api = require('../../api');
const { PRODUCT, STATUS } = require('../../constants');

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

const dashboardFilters = (filter, user) => {
  const allFilters = [];

  const { createdByYou } = filter;

  if (createdByYou) {
    allFilters.push({
      field: 'userId',
      value: user._id,
    });
  }

  return allFilters;
};

exports.bssDeals = async (req, res) => {
  const tab = 'bssDeals';
  const { userToken } = requestParams(req);
  const { isMaker, isChecker } = getRoles(req.session.user.roles);

  let filters = [];
  filters = dashboardFilters(req.body, req.session.user);

  if (isChecker && !isMaker) {
    filters.push({
      field: 'status',
      value: STATUS.readyForApproval,
    });
  }

  const { count, deals } = await getApiData(api.allDeals(
    req.params.page * PAGESIZE,
    PAGESIZE,
    filters,
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
  filters = dashboardFilters(req.body, req.session.user);

  if (isChecker && !isMaker) {
    filters.push({
      field: 'status',
      value: STATUS.readyForApproval,
    });
  }

  const { count, deals: rawDeals } = await getApiData(
    api.gefDeals(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const deals = rawDeals.map((deal) => {
    let exporter = '';

    if (deal.exporter && deal.exporter.companyName) {
      exporter = deal.exporter.companyName;
    }

    return {
      _id: deal._id,
      status: deal.status,
      bankRef: deal.bankInternalRefName,
      exporter,
      product: PRODUCT.GEF,
      submissionType: deal.submissionType,
      updatedAt: deal.updatedAt || deal.createdAt,
    };
  })
    .sort((a, b) => b.updatedAt - a.updatedAt);

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
