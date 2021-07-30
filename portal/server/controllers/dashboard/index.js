import api from '../../api';

import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../../helpers';

const PAGESIZE = 20;
const primaryNav = 'home';

export const bssDeals = async (req, res) => {
  const tab = 'bssDeals';
  const { userToken } = requestParams(req);

  const { count, deals } = await getApiData(
    api.allDeals(req.params.page * PAGESIZE, PAGESIZE, {}, userToken),
    res,
  );

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
  });
};

export const gefDeals = async (req, res) => {
  const tab = 'gefDeals';
  const { userToken } = requestParams(req);

  const { count, deals: rawDeals } = await getApiData(
    api.gefDeals(req.params.page * PAGESIZE, PAGESIZE, {}, userToken),
    res,
  );

  const deals = rawDeals.map((deal) => ({
    _id: deal._id,
    status: deal.status,
    bankRef: deal.bankInternalRefName,
    exporter: deal.exporter.companyName,
    product: 'GEF',
    type: '-', // TODO: when types are established this needs to be added into dashboard
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
  });
};
