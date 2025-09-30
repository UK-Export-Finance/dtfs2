const api = require('../../../../../api');
const validateSubmittedValues = require('./validateSubmittedValues');
const { userCanEditGeneral } = require('../helpers');

/**
 * Controller to get underwriting facility risk profile page
 * @async
 * @function getUnderWritingFacilityRiskProfileEdit
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders underwriting facility risk profile page
 */
const getUnderWritingFacilityRiskProfileEdit = async (req, res) => {
  const { _id: dealId, facilityId } = req.params;
  const { userToken } = req.session;

  const deal = await api.getDeal(dealId, userToken);
  const facility = await api.getFacility(facilityId, userToken);

  if (!deal || !facility || !userCanEditGeneral(req.session.user)) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/edit-facility-risk-profile/edit-facility-risk-profile.njk', {
    deal: deal.dealSnapshot,
    facility,
    tfm: deal.tfm,
    dealId,
    user: req.session.user,
  });
};

/**
 * Controller to post underwriting facility risk profile
 * @async
 * @function postUnderWritingFacilityRiskProfileEdit
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Redirects to the next page
 */
const postUnderWritingFacilityRiskProfileEdit = async (req, res) => {
  const { _id: dealId, facilityId } = req.params;
  const { userToken } = req.session;

  const deal = await api.getDeal(dealId, userToken);
  const facility = await api.getFacility(facilityId, userToken);

  if (!deal || !facility || !userCanEditGeneral(req.session.user)) {
    return res.redirect('/not-found');
  }
  delete req.body._csrf;

  const validationErrors = validateSubmittedValues(req.body);

  if (validationErrors) {
    return res.render('case/underwriting/pricing-and-risk/edit-facility-risk-profile/edit-facility-risk-profile.njk', {
      deal: deal.dealSnapshot,
      facility,
      tfm: deal.tfm,
      dealId,
      user: req.session.user,
      validationErrors,
    });
  }

  const facilityUpdate = req.body;

  await api.updateFacilityRiskProfile(facilityId, facilityUpdate, userToken);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getUnderWritingFacilityRiskProfileEdit,
  postUnderWritingFacilityRiskProfileEdit,
};
