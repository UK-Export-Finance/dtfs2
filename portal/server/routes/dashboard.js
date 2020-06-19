import express from 'express';
import api from '../api';
import buildDashboardFilters from './buildDashboardFilters';

import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../helpers';

const router = express.Router();
const PAGESIZE = 20;

router.get('/dashboard', async (req, res) => {
  const { userToken } = requestParams(req);
  req.session.dashboardFilters = null;

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    res.redirect('/dashboard/0');
  }
});

router.get('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    // when checker views the dashboard it defaults to status=readyForApproval
    if (req.session.dashboardFilters === null && req.session.user.roles.includes('checker')) {
      req.session.dashboardFilters = {
        filterByStatus: 'readyForApproval',
        isUsingAdvancedFilter: true,
      };
    }

    const { isUsingAdvancedFilter, filters } = buildDashboardFilters(req.session.dashboardFilters, req.session.user);

    const dealData = await getApiData(
      api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
      res,
    );

    const pages = {
      totalPages: Math.ceil(dealData.count / PAGESIZE),
      currentPage: parseInt(req.params.page, 10),
      totalItems: dealData.count,
    };

    return res.render('dashboard/deals.njk', {
      pages,
      contracts: dealData.deals,
      banks: await getApiData(
        api.banks(userToken),
        res,
      ),
      successMessage: getFlashSuccessMessage(req),
      filter: {
        isUsingAdvancedFilter,
        ...req.session.dashboardFilters,
      },
      user: req.session.user,
    });
  }
});

router.post('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    const dashboardFilters = req.body;

    req.session.dashboardFilters = dashboardFilters;

    const { isUsingAdvancedFilter, filters } = buildDashboardFilters(dashboardFilters, req.session.user);

    const dealData = await getApiData(
      api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
      res,
    );

    const pages = {
      totalPages: Math.ceil(dealData.count / PAGESIZE),
      currentPage: parseInt(req.params.page, 10),
      totalItems: dealData.count,
    };

    return res.render('dashboard/deals.njk', {
      pages,
      contracts: dealData.deals,
      banks: await getApiData(
        api.banks(userToken),
        res,
      ),
      filter: {
        isUsingAdvancedFilter,
        ...dashboardFilters,
      },
      user: req.session.user,
    });
  }
});

router.get('/dashboard/transactions', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    const { transactions } = await getApiData(
      api.transactions(userToken),
      res,
    );

    return res.render('dashboard/transactions.njk', {
      transactions,
      banks: await getApiData(
        api.banks(userToken),
        res,
      ),
    });
  }
});

export default router;
