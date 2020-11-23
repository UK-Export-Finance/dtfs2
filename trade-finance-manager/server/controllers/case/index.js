import api from '../../api';

// NOTE
// the relationship between deal & case is currently unknown,
// and therefore how this will be managed/stored/referenced.
// This approachis purely for initial development.

const getCaseDeal = async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/deal/deal.njk', {
    deal,
  });
};

export default {
  getCaseDeal,
};

