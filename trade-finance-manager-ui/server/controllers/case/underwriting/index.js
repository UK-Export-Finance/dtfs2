const { format, fromUnixTime } = require('date-fns');
const api = require('../../../api');

const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const underwriterManagersDecision = require('./underwriter-managers-decision');
const { getAmendmentLeadUnderwriter } = require('../amendments');
const { userCanEditManagersDecision, userCanEditBankDecision, ukefDecisionRejected } = require('../../helpers');
const { formattedNumber } = require('../../../helpers/number');
const { UNDERWRITER_MANAGER_DECISIONS_TAGS } = require('../../../constants/decisions.constant');
const { BANK_DECISIONS_TAGS } = require('../../../constants/amendments');

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

  // gets latest amendment in progress
  const { data: amendment } = await api.getAmendmentInProgressByDealId(dealId);

  // if amendments object exists then populate fields
  if (amendment?.submittedByPim) {
    if (amendment?.ukefDecision) {
      amendment.ukefDecision.isEditable = userCanEditManagersDecision(amendment, user);
      // if bank decision then set isEditable in relevant way
      if (amendment?.bankDecision) {
        amendment.bankDecision.isEditable = userCanEditBankDecision(amendment, user);
      } else {
        amendment.bankDecision = { isEditable: userCanEditBankDecision(amendment, user) };
      }
      // checks if declined by UKEF
      if (amendment.ukefDecision?.submitted) {
        amendment.ukefDecision.isDeclined = ukefDecisionRejected(amendment);
      }
    } else {
      amendment.ukefDecision = { isEditable: userCanEditManagersDecision(amendment, user) };
    }

    const response = await getAmendmentLeadUnderwriter(amendment, user);
    amendment.leadUnderwriter = {
      isEditable: response.isEditable,
      ...response.leadUnderwriter,
    };

    if (amendment?.changeCoverEndDate && amendment?.coverEndDate) {
      amendment.currentCoverEndDate = format(fromUnixTime(amendment.currentCoverEndDate), 'dd MMMM yyyy');
      amendment.coverEndDate = format(fromUnixTime(amendment.coverEndDate), 'dd MMMM yyyy');
    }

    if (amendment?.changeFacilityValue && amendment?.value) {
      amendment.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
      amendment.currentValue = amendment?.currentValue ? `${amendment.currency} ${formattedNumber(amendment.currentValue)}` : null;
    }

    if (amendment.ukefDecision.submitted) {
      const date = format(fromUnixTime(amendment.ukefDecision.submittedAt), 'dd MMMM yyyy');
      const time = format(fromUnixTime(amendment.ukefDecision.submittedAt), 'HH:mm aaa');
      amendment.ukefDecision.submittedAt = `${date} at ${time}`;
    }
    amendment.tags = UNDERWRITER_MANAGER_DECISIONS_TAGS;
    amendment.bankDecisionTags = BANK_DECISIONS_TAGS;

    if (amendment?.bankDecision?.receivedDate) {
      amendment.bankDecision.receivedDateFormatted = format(fromUnixTime(amendment.bankDecision.receivedDate), 'dd MMM yyyy');
    }
    if (amendment?.bankDecision?.effectiveDate) {
      amendment.bankDecision.effectiveDateFormatted = format(fromUnixTime(amendment.bankDecision.effectiveDate), 'dd MMM yyyy');
    }
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
