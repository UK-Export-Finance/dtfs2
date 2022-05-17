const api = require('../../../../api');
const canUserEditManagersDecision = require('./helpers');
const { validateSubmittedValues } = require('./validateSubmittedValues');
const { mapDecisionObject } = require('./mapDecisionObject');

const getUnderwriterManagersDecision = async (deal, user) => {
  const userCanEdit = canUserEditManagersDecision(
    user,
    deal.dealSnapshot.submissionType,
    deal.tfm,
  );

  return {
    userCanEdit,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
  };
};

const getUnderwriterManagersDecisionEdit = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal) {
    return res.redirect('/not-found');
  }

  const userCanEdit = canUserEditManagersDecision(
    user,
    deal.dealSnapshot.submissionType,
    deal.tfm,
  );

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/managers-decision/edit-managers-decision.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
  });
};

const postUnderwriterManagersDecision = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal) {
    return res.redirect('/not-found');
  }

  const userCanEdit = canUserEditManagersDecision(
    user,
    deal.dealSnapshot.submissionType,
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
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId: deal.dealSnapshot._id,
      user,
      submittedValues,
      validationErrors,
    });
  }

  const update = mapDecisionObject(submittedValues, user);

  await api.updateUnderwriterManagersDecision(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getUnderwriterManagersDecision,
  getUnderwriterManagersDecisionEdit,
  postUnderwriterManagersDecision,
};
