import api from '../../../../api';
import canUserEdit from './helpers';
import { validateSubmittedValues } from './validateSubmittedValues';
import { mapDecisionObject } from './mapDecisionObject';

const getUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal) {
    return res.redirect('/not-found');
  }

  const userCanEdit = canUserEdit(
    user,
    deal.dealSnapshot.details.submissionType,
    deal.tfm,
  );

  return res.render('case/underwriting/managers-decision/managers-decision.njk', {
    userCanEdit,
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

  if (!deal) {
    return res.redirect('/not-found');
  }

  const userCanEdit = canUserEdit(
    user,
    deal.dealSnapshot.details.submissionType,
    deal.tfm,
  );

  if (!userCanEdit) {
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

  if (!deal) {
    return res.redirect('/not-found');
  }

  const userCanEdit = canUserEdit(
    user,
    deal.dealSnapshot.details.submissionType,
    deal.tfm,
  );

  if (!userCanEdit) {
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
