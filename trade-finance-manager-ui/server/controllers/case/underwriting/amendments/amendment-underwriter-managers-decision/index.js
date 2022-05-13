const api = require('../../../../../api');

const { canUserEditManagersDecision } = require('../helpers');
// const { validateSubmittedValues } = require('./validateSubmittedValues');
// const { mapDecisionObject } = require('./mapDecisionObject');

/**
 * @param {Object} deal
 * @param {Object} amendment
 * @param {Object} user
 * @returns {Object}
 * checks if user can edit managers decision and returns object
 */
const getAmendmentUnderwriterManagersDecision = async (deal, amendment, user) => {
  const userCanEdit = canUserEditManagersDecision(
    user,
    amendment.amendments,
  );

  return {
    userCanEdit,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
    amendment,
  };
};

/**
 * @param {*} req
 * @param {*} res
 * renders first page of amendment managers decision if can be editted by user
 */
const getAmendmentUnderwriterManagersDecisionEdit = async (req, res) => {
  const {
    _id: dealId,
    amendmentId,
    facilityId,
  } = req.params;
  const deal = await api.getDeal(dealId);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if ((!amendment || !amendment.amendmentId) || !deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const userCanEdit = canUserEditManagersDecision(
    user,
    amendment,
  );

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/amendments/amendment-managers-decision/amendment-edit-managers-decision.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
    amendment,
  });
};

// const postUnderwriterManagersDecision = async (req, res) => {
//   const dealId = req.params._id;
//   const deal = await api.getDeal(dealId);

//   const { user } = req.session;

//   if (!deal) {
//     return res.redirect('/not-found');
//   }

//   const userCanEdit = canUserEditManagersDecision(
//     user,
//     deal.dealSnapshot.submissionType,
//     deal.tfm,
//   );

//   if (!userCanEdit) {
//     return res.redirect('/not-found');
//   }

//   const {
//     decision,
//     approveWithConditionsComments,
//     declineComments,
//     internalComments,
//   } = req.body;

//   const submittedValues = {
//     decision,
//     approveWithConditionsComments,
//     declineComments,
//     internalComments,
//   };

//   const validationErrors = validateSubmittedValues(submittedValues);

//   if (validationErrors) {
//     return res.render('case/underwriting/managers-decision/edit-managers-decision.njk', {
//       activePrimaryNavigation: 'manage work',
//       activeSubNavigation: 'underwriting',
//       deal: deal.dealSnapshot,
//       tfm: deal.tfm,
//       dealId: deal.dealSnapshot._id,
//       user,
//       submittedValues,
//       validationErrors,
//     });
//   }

//   const update = mapDecisionObject(submittedValues, user);

//   await api.updateUnderwriterManagersDecision(dealId, update);

//   return res.redirect(`/case/${dealId}/underwriting`);
// };

module.exports = {
  getAmendmentUnderwriterManagersDecision,
  getAmendmentUnderwriterManagersDecisionEdit,
  // postUnderwriterManagersDecision,
};
