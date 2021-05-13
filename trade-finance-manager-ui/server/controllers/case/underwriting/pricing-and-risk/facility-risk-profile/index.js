import api from '../../../../../api';

const getUnderWritingPricingAndRiskFacilityRiskProfileEdit = async (req, res) => {
  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    facilityId,
  } = req.params;

  const deal = await api.getDeal(dealId);
  const facility = await api.getFacility(facilityId);

  if (!deal || !facility) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/edit-facility-risk-profile.njk', {
    deal: deal.dealSnapshot,
    facilityId,
    tfm: deal.tfm,
    dealId,
    user: req.session.user,
  });
};

const postUnderWritingPricingAndRiskFacilityRiskProfileEdit = () => 'test';

export default {
  getUnderWritingPricingAndRiskFacilityRiskProfileEdit,
  postUnderWritingPricingAndRiskFacilityRiskProfileEdit,
};
