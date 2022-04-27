const api = require('../../../api');

const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const underwriterManagersDecision = require('./underwriter-managers-decision');

/**
 * controller for underwriting tab
 * gets dealId and user
 * gets deal
 * gets objects from relevant pages
 * renders underwriting page with deal, tfm, dealId, user, leadUnderwriter, pricingAndRisk, underwriterManagersDecision
 */
const getUnderwriterPage = async (req, res) => {
  const dealId = req.params._id;
  const { user } = req.session;

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const leadUnderWriterData = await leadUnderwriter.getLeadUnderwriter(deal, user);
  const pricingAndRiskData = await pricingAndRisk.getUnderWritingPricingAndRisk(deal, user);
  const underwriterManagersDecisionData = await underwriterManagersDecision.getUnderwriterManagersDecision(deal, user);

  return res.render('case/underwriting/underwriting.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
    leadUnderwriter: leadUnderWriterData,
    pricingAndRisk: pricingAndRiskData,
    underwriterManagersDecision: underwriterManagersDecisionData,
  });
};

module.exports = {
  ...leadUnderwriter,
  ...pricingAndRisk,
  ...underwriterManagersDecision,
  getUnderwriterPage,
};
