import api from '../../../../api';
import validateSubmittedValues from './validateSubmittedValues';

const getUnderWritingManagersDecision = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  return res.render('case/underwriting/managers-decision/managers-decision.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'bank security',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
  });
};

const postUnderWritingManagersDecision = async (req, res) => {
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
      activeSideNavigation: 'bank security',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user,
      submittedValues,
      validationErrors,
    });
  }

  const update = submittedValues;

  await api.updateUnderWritingManagersDecision(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/underwriter-managers-decision`);
};

export default {
  getUnderWritingManagersDecision,
  postUnderWritingManagersDecision,
};
