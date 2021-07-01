import api from '../../api';

import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../../helpers';

const PAGESIZE = 20;
const primaryNav = 'home';

const dealsDashboard = async (req, res) => {
  const { userToken } = requestParams(req);

  // TODO: reinstate filters

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
    user: req.session.user,
  });
};

export default dealsDashboard;
