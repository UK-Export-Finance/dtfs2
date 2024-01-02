const api = require('../../api');
const { generateHeadingText } = require('../helpers');
const CONSTANTS = require('../../constants');

const getDeals = async (req, res) => {
  if (req.params.pageNumber < 0) {
    return res.redirect('/not-found');
  }

  const queryParams = {
    sortBy: CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT,
    pagesize: CONSTANTS.DEALS.PAGE_SIZE,
    page: req.params.pageNumber || 0,
  };

  const { userToken } = req.session;

  const { deals, pagination } = await api.getDeals(queryParams, userToken);
  const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);

  if (req.params.pageNumber >= pagination.totalPages) {
    return res.redirect('/not-found');
  }

  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    amendments.map((item) => {
      const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
      if (amendmentInProgress) {
        return deals.map((deal) => {
          if (item.dealId === deal._id) {
            // eslint-disable-next-line no-param-reassign
            deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
          }
          return deal;
        });
      }
      return item;
    });
  }

  if (deals) {
    return res.render('deals/deals.njk', {
      heading: 'All deals',
      deals,
      activePrimaryNavigation: 'all deals',
      activeSubNavigation: 'deal',
      user: req.session.user,
      activeSortByField: CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.field,
      activeSortByOrder: CONSTANTS.DEALS.TFM_SORT_BY_DEFAULT.order,
      pages: {
        totalPages: parseInt(pagination.totalPages, 10),
        currentPage: parseInt(pagination.currentPage, 10),
        totalItems: parseInt(pagination.totalItems, 10),
      },
    });
  }

  return res.redirect('/not-found');
};

const queryDeals = async (req, res) => {
  if (req.params.pageNumber < 0) {
    return res.redirect('/not-found');
  }

  let activeSortByOrder = CONSTANTS.DEALS.TFM_SORT_BY.ASCENDING;
  let activeSortByField = '';
  let searchString = '';
  const { userToken } = req.session;

  delete req.body._csrf;

  if (req.body.search) {
    searchString = req.body.search;
  }

  const queryParams = {
    searchString,
    pagesize: CONSTANTS.DEALS.PAGE_SIZE,
    page: req.params.pageNumber || 0,
  };

  if (req.body.descending || req.body.ascending) {
    const sortBy = Object.getOwnPropertyNames(req.body)[0];
    const sortByField = req.body[sortBy];
    activeSortByField = sortByField;

    queryParams.sortBy = {
      field: sortByField,
      order: sortBy,
    };
  }

  const { deals, pagination } = await api.getDeals(queryParams, userToken);

  if (req.params.pageNumber >= pagination.totalPages) {
    return res.redirect('/not-found');
  }

  if (req.body.descending) {
    activeSortByOrder = CONSTANTS.DEALS.TFM_SORT_BY.DESCENDING;
  }

  const { data: amendments } = await api.getAllAmendmentsInProgress(userToken);

  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    amendments.map((item) => {
      const amendmentInProgress = item.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
      if (amendmentInProgress) {
        return deals.map((deal) => {
          if (item.dealId === deal._id) {
            // eslint-disable-next-line no-param-reassign
            deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
          }
          return deal;
        });
      }
      return item;
    });
  }

  return res.render('deals/deals.njk', {
    heading: generateHeadingText(pagination.totalItems, searchString),
    deals,
    activePrimaryNavigation: 'all deals',
    activeSubNavigation: 'deal',
    user: req.session.user,
    activeSortByField,
    activeSortByOrder,
    pages: {
      totalPages: parseInt(pagination.totalPages, 10),
      currentPage: parseInt(pagination.currentPage, 10),
      totalItems: parseInt(pagination.totalItems, 10),
    },
  });
};

module.exports = {
  getDeals,
  queryDeals,
};
