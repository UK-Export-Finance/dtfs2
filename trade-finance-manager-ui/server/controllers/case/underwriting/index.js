const api = require('../../../api');

const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const underwriterManagersDecision = require('./underwriter-managers-decision');
const amendmentLeadUnderwriter = require('./amendments/amendment-lead-underwriter');
const amendmentUnderwriterManagersDecision = require('./amendments/amendment-underwriter-managers-decision');
const amendmentBanksDecision = require('./amendments/amendment-banks-decision');

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

  // gets latest in progress amendment
  const { data: amendment } = await api.getAmendmentInProgressByDealId(dealId);

  let amendmentLeadUnderwriterData = {};
  let amendmentUnderwriterManagersDecisionData = {};
  let amendmentBanksDecisionData = {};

  // if amendments object exists then populate fields
  if (amendment.amendments) {
    amendmentLeadUnderwriterData = await amendmentLeadUnderwriter.getAmendmentLeadUnderwriter(deal, amendment, user);
    amendmentUnderwriterManagersDecisionData = await amendmentUnderwriterManagersDecision.getAmendmentUnderwriterManagersDecision(deal, amendment, user);
    amendmentBanksDecisionData = await amendmentBanksDecision.getAmendmentBankDecision(deal, amendment, user);
  }

  return res.render('case/underwriting/underwriting.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
    leadUnderwriter: leadUnderWriterData,
    pricingAndRisk: pricingAndRiskData,
    underwriterManagersDecision: underwriterManagersDecisionData,
    amendmentData: amendment,
    amendmentLeadUnderwriter: amendmentLeadUnderwriterData,
    amendmentUnderwriterManagersDecision: amendmentUnderwriterManagersDecisionData,
    amendmentBanksDecision: amendmentBanksDecisionData,
  });
};

module.exports = {
  ...leadUnderwriter,
  ...pricingAndRisk,
  ...underwriterManagersDecision,
  ...amendmentLeadUnderwriter,
  ...amendmentUnderwriterManagersDecision,
  ...amendmentBanksDecision,
  getUnderwriterPage,
};
