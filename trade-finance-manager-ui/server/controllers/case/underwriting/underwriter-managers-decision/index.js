import api from '../../../../api';
import validateSubmittedValues from './validateSubmittedValues';
import mapDecisionHelper from './mapDecisionObject';
import userHelpers from '../../../../helpers/user';
import CONSTANTS from '../../../../constants';

const { mapDecisionObject } = mapDecisionHelper;
const { userIsInTeam } = userHelpers;

// TODO only if deal is MIA

const getUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal) {
    return res.redirect('/not-found');
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

const getUnderwriterManagersDecisionEdit = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal || !userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS)) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/managers-decision/edit-managers-decision.njk', {
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
    return res.render('case/underwriting/managers-decision/edit-managers-decision.njk', {
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

  return res.redirect(`/case/${dealId}/underwriting/managers-decision`);
};

export default {
  getUnderwriterManagersDecision,
  getUnderwriterManagersDecisionEdit,
  postUnderwriterManagersDecision,
};
