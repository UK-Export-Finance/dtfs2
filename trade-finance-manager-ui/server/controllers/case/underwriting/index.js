const { format, fromUnixTime } = require('date-fns');
const { isEmpty } = require('lodash');
const api = require('../../../api');

const leadUnderwriter = require('./lead-underwriter');
const pricingAndRisk = require('./pricing-and-risk');
const underwriterManagersDecision = require('./underwriter-managers-decision');
const { getAmendmentLeadUnderwriter } = require('../amendments');
const { userCanEditManagersDecision, userCanEditBankDecision, ukefDecisionRejected } = require('../../helpers');
const { formattedNumber } = require('../../../helpers/number');
const { UNDERWRITER_MANAGER_DECISIONS_TAGS } = require('../../../constants/decisions.constant');
const { BANK_DECISIONS_TAGS } = require('../../../constants/amendments');
const CONSTANTS = require('../../../constants');
const { hasAmendmentInProgressDealStage, amendmentsInProgressByDeal } = require('../../helpers/amendments.helper');
const { getDealSuccessBannerMessage } = require('../../helpers/get-success-banner-message.helper');

/**
 * controller for underwriting tab
 * gets dealId and user
 * gets deal
 * gets objects from relevant pages
 * renders underwriting page with deal, tfm, dealId, user, leadUnderwriter, pricingAndRisk, underwriterManagersDecision
 */
const getUnderwriterPage = async (req, res) => {
  const dealId = req?.params?._id;
  const { user, userToken } = req.session;

  if (!dealId || !user || !userToken) {
    console.error('Void request received %s %s %s', dealId, user, userToken);
    return res.render('_partials/problem-with-service.njk');
  }

  const deal = await api.getDeal(dealId, userToken);

  if (isEmpty(deal)) {
    console.error('Invalid deal %s response received', dealId);
    return res.render('_partials/problem-with-service.njk');
  }

  const dealLeadUnderWriter = await leadUnderwriter.getLeadUnderwriter(deal, user, userToken);
  const dealPricingAndRisk = pricingAndRisk.getUnderWritingPricingAndRisk(deal, user);
  const dealUnderwriterManagersDecision = underwriterManagersDecision.getUnderwriterManagersDecision(deal, user);
  const submittedAmendments = [];
  // gets latest amendment in progress
  let { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);

  if (!amendments) {
    console.error('Unable to get amendments for deal id %s', dealId);
    return res.redirect('/not-found');
  }

  // filters the amendments submittedByPim and also which are not automatic
  amendments = amendments.filter(({ submittedByPim, requireUkefApproval }) => submittedByPim && requireUkefApproval);

  const amendmentsInProgress = await amendmentsInProgressByDeal(amendments, userToken);
  const hasAmendmentInProgress = hasAmendmentInProgressDealStage(amendments);
  if (hasAmendmentInProgress) {
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }

  // if amendments object exists then populate fields
  if (amendments.length) {
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const amendment of amendments) {
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

      const response = await getAmendmentLeadUnderwriter(amendment, user, userToken);
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

      if (amendment?.ukefDecision?.submitted) {
        const date = format(fromUnixTime(amendment.ukefDecision.submittedAt), 'dd MMMM yyyy');
        const time = format(fromUnixTime(amendment.ukefDecision.submittedAt), 'h:mm aaa');
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

      submittedAmendments.push(amendment);
    }
  }

  const { dealSnapshot } = deal;

  const successMessage = await getDealSuccessBannerMessage({
    dealSnapshot,
    userToken,
    req,
  });

  return res.render('case/underwriting/underwriting.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    successMessage,
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
    leadUnderwriter: dealLeadUnderWriter,
    pricingAndRisk: dealPricingAndRisk,
    underwriterManagersDecision: dealUnderwriterManagersDecision,
    amendments: submittedAmendments,
    amendmentsInProgress,
    hasAmendmentInProgress,
  });
};

module.exports = {
  ...leadUnderwriter,
  ...pricingAndRisk,
  ...underwriterManagersDecision,
  getUnderwriterPage,
};
