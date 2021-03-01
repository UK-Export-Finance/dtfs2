import api from '../../api';

const getDeals = async (req, res) => {
  const deals = await api.getDeals();
  if (!deals) {
    return res.redirect('/not-found');
  }

  return res.render('deals/deals.njk', {
    deals,
    active_sheet: 'deal',
    user: req.session.user,
  });
};

export default {
  getDeals,
};
