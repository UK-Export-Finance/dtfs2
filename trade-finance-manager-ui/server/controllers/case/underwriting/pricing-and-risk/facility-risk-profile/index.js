import api from '../../../../../api';
import validateSubmittedValues from './validateSubmittedValues';

const getUnderWritingRiskFacilityRiskProfileEdit = async (req, res) => {
  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    facilityId,
  } = req.params;

  const deal = await api.getDeal(dealId);
  const facility = await api.getFacility(facilityId);

  if (!deal || !facility) {
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


const postUnderWritingRiskFacilityRiskProfileEdit = async (req, res) => {
  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    facilityId,
  } = req.params;

  const deal = await api.getDeal(dealId);
  const facility = await api.getFacility(facilityId);

  if (!deal || !facility) {
    return res.redirect('/not-found');
  }

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

  // const update = req.body;
  // await api.updateUnderwriterManagersDecision(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

export default {
  getUnderWritingRiskFacilityRiskProfileEdit,
  postUnderWritingRiskFacilityRiskProfileEdit,
};
