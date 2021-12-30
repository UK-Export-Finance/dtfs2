const api = require('../../api');
const { STATUS } = require('../../constants');

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

const dashboardFilters = (filter, user, dealType) => {
  const allFilters = [];

  const { createdByYou } = filter;

  if (createdByYou) {
    allFilters.push({
      field: 'userId',
      value: user._id,
    });
  }

  if (dealType === PRODUCT.BSS_EWCS) {
    allFilters.push({
      field: 'details.owningBank.id',
      value: user.bank.id,
    });
  }

  if (dealType === PRODUCT.GEF) {
    allFilters.push({
      field: 'bank.id',
      value: user.bank.id,
    });
  }

  return allFilters;
};
*/

exports.allDeals = async (req, res) => {
  const tab = 'deals';
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
