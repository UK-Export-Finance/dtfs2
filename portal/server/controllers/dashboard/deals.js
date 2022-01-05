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

exports.allDeals = async (req, res) => {
  const tab = 'deals';
  const { userToken } = requestParams(req);
  const { isMaker, isChecker } = getRoles(req.session.user.roles);

  let filters = [];
  filters = dashboardFilters(req.body, req.session.user);

  console.log('----- filters \n', filters);

  if (isChecker && !isMaker) {
    filters.push({
      field: 'status',
      value: STATUS.readyForApproval,
    });
  }

  console.log('----- filters 2\n', filters);

  const { count, deals } = await getApiData(api.allDeals(
    req.params.page * PAGESIZE,
    PAGESIZE,
    filters,
    userToken,
  ), res);

  console.log('----- count ', count);
  console.log('----- deals \n', deals);

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  console.log('----- pages \n', pages);
  const bingo = {
    deals,
    pages,
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
    createdByYou: req.body.createdByYou,
  };

  console.log('----- bingo \n', bingo);

  return res.render('dashboard/deals.njk', bingo);
};
