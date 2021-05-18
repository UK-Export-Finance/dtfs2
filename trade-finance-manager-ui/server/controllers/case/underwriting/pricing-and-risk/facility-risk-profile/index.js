import api from '../../../../../api';
import validateSubmittedValues from './validateSubmittedValues';
import { userCanEditGeneral } from '../helpers';

const getUnderWritingFacilityRiskProfileEdit = async (req, res) => {
  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    facilityId,
  } = req.params;

  const deal = await api.getDeal(dealId);
  const facility = await api.getFacility(facilityId);

  if (!deal
    || !facility
    || !userCanEditGeneral(req.session.user)) {
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


const postUnderWritingFacilityRiskProfileEdit = async (req, res) => {
  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    facilityId,
  } = req.params;

  const deal = await api.getDeal(dealId);
  const facility = await api.getFacility(facilityId);

  if (!deal || !facility || !userCanEditGeneral(req.session.user)) {
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

  const facilityUpdate = req.body;

  await api.updateFacilityRiskProfile(facilityId, facilityUpdate);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

export default {
  getUnderWritingFacilityRiskProfileEdit,
  postUnderWritingFacilityRiskProfileEdit,
};
