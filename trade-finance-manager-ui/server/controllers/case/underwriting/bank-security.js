import api from '../../../api';
import helpers from './helpers';

const { isDecisionSubmitted } = helpers;

const getUnderWritingBankSecurity = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const decisionSubmitted = isDecisionSubmitted(deal.tfm);

  return res.render('case/underwriting/bank-security/bank-security.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'bank security',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    decisionSubmitted,
  });
};


export default {
  getUnderWritingBankSecurity,
};
