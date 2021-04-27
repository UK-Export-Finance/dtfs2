import api from '../../../../api';
import validateSubmittedValues from './validateSubmittedValues';
import mapSubmittedValues from './mapSubmittedValues';
import helpers from '../helpers';

const { isDecisionSubmitted } = helpers;

const getUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  // TODO if decision submitted, redirect

  const { user } = req.session;

  return res.render('case/underwriting/managers-decision/managers-decision.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'underwriter managers decision',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
  });
};

const getUnderwriterManagersDecisionSubmitted = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const decisionSubmitted = isDecisionSubmitted(deal.tfm);

  if (!deal || !decisionSubmitted) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  return res.render('case/underwriting/managers-decision/managers-decision-submitted.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'underwriter managers decision',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    decisionSubmitted,
  });
};

const postUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const {
    decision,
    approveWithConditionsComments,
    declineComments,
    internalComments,
  } = req.body;

  const submittedValues = {
    decision,
    approveWithConditionsComments,
    declineComments,
    internalComments,
  };

  const validationErrors = validateSubmittedValues(submittedValues);

  if (validationErrors) {
    return res.render('case/underwriting/managers-decision/managers-decision.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'underwriter managers decision',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user,
      submittedValues,
      validationErrors,
    });
  }

  const update = mapSubmittedValues(submittedValues);

  await api.updateUnderwriterManagersDecision(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/managers-decision`);
};

export default {
  getUnderwriterManagersDecision,
  getUnderwriterManagersDecisionSubmitted,
  postUnderwriterManagersDecision,
};
