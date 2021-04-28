import api from '../../../../api';
import validateSubmittedValues from './validateSubmittedValues';
import mapDecisionHelper from './mapDecisionObject';
import helpers from '../helpers';
import userHelpers from '../../../../helpers/user';
import CONSTANTS from '../../../../constants';

const { mapDecisionObject } = mapDecisionHelper;
const { isDecisionSubmitted } = helpers;
const { userIsInTeam } = userHelpers;

const getUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal || !userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS)) {
    return res.redirect('/not-found');
  }

  const decisionSubmitted = isDecisionSubmitted(deal.tfm);

  if (decisionSubmitted) {
    return res.redirect(`/case/${dealId}/underwriting/managers-decision/submitted`);
  }

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

  if (!deal) {
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
  });
};

const postUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal || !userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS)) {
    return res.redirect('/not-found');
  }

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

  const update = mapDecisionObject(submittedValues, user);

  await api.updateUnderwriterManagersDecision(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/managers-decision/submitted`);
};

export default {
  getUnderwriterManagersDecision,
  getUnderwriterManagersDecisionSubmitted,
  postUnderwriterManagersDecision,
};
