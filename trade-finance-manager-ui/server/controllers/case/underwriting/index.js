const api = require('../../../api');

const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const underwriterManagersDecision = require('./underwriter-managers-decision');
const { getAmendmentLeadUnderwriter, getAmendmentUnderwriterManagersDecision, getAmendmentBankDecision } = require('../amendments');

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

  const dealLeadUnderWriter = await leadUnderwriter.getLeadUnderwriter(deal, user);
  const dealPricingAndRisk = await pricingAndRisk.getUnderWritingPricingAndRisk(deal, user);
  const dealUnderwriterManagersDecision = await underwriterManagersDecision.getUnderwriterManagersDecision(deal, user);

  // gets latest in progress amendment
  let { data: amendment } = await api.getAmendmentInProgressByDealId(dealId);

  // if amendments object exists then populate fields
  if (amendment?.submittedByPim) {
    const amendmentLeadUnderwriter = await getAmendmentLeadUnderwriter(amendment, user);
    const amendmentUnderwriterManagerDecision = await getAmendmentUnderwriterManagersDecision(amendment, user);
    const amendmentBankDecision = await getAmendmentBankDecision(amendment, user);
    amendment = {
      ...amendment,
      leadUnderwriter: amendmentLeadUnderwriter,
      underwriterManagerDecision: amendmentUnderwriterManagerDecision,
      banksDecision: amendmentBankDecision,
    };
  }

  return res.render('case/underwriting/underwriting.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
    leadUnderwriter: dealLeadUnderWriter,
    pricingAndRisk: dealPricingAndRisk,
    underwriterManagersDecision: dealUnderwriterManagersDecision,
    amendment,
  });
};

module.exports = {
  ...leadUnderwriter,
  ...pricingAndRisk,
  ...underwriterManagersDecision,
  getUnderwriterPage,
};
