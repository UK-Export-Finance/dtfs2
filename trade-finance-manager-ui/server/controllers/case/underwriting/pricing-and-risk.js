import api from '../../../api';
import caseHelpers from '../helpers';
import underwritingHelpers from './helpers';
import stringHelpers from '../../../helpers/string';
import CONSTANTS from '../../../constants';

const {
  userIsInTeam,
} = caseHelpers;

const {
  isDecisionSubmitted,
} = underwritingHelpers;

const {
  hasValue,
  containsNumber,
} = stringHelpers;

const getUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const decisionSubmitted = isDecisionSubmitted(deal.tfm);

  return res.render('case/underwriting/pricing-and-risk/pricing-and-risk.njk', {
    userCanEdit: userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT),
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    decisionSubmitted,
  });
};

const getUnderWritingPricingAndRiskEdit = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const postUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const existingValue = deal.tfm.exporterCreditRating;
  let submittedValue;

  if (hasValue(req.body.exporterCreditRatingOther)
    && req.body.exporterCreditRatingOther !== existingValue) {
    submittedValue = req.body.exporterCreditRatingOther;
  } else {
    submittedValue = req.body.exporterCreditRating;
  }

  let validationErrors;

  const selectedOther = req.body.exporterCreditRating === 'Other';
  const otherValue = hasValue(req.body.exporterCreditRatingOther);
  const otherValueHasNumericValues = containsNumber(req.body.exporterCreditRatingOther);

  const noOptionSelected = !hasValue(req.body.exporterCreditRating);

  const hasValidationError = ((selectedOther && !otherValue)
    || (selectedOther && otherValueHasNumericValues)
    || noOptionSelected);

  if (hasValidationError) {
    if (noOptionSelected) {
      validationErrors = {
        count: 1,
        errorList: {
          exporterCreditRating: {
            text: 'Enter a credit rating',
            order: '1',
          },
        },
        summary: [{
          text: 'Enter a credit rating',
          href: '#exporterCreditRating',
        }],
      };
    }

    if (selectedOther) {
      if (!otherValue) {
        validationErrors = {
          count: 1,
          errorList: {
            exporterCreditRatingOther: {
              text: 'Enter a credit rating',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a credit rating',
            href: '#exporterCreditRatingOther',
          }],
        };
      }

      if (otherValueHasNumericValues) {
        validationErrors = {
          count: 1,
          errorList: {
            exporterCreditRatingOther: {
              text: 'Credit rating must not include numbers',
              order: '1',
            },
          },
          summary: [{
            text: 'Credit rating must not include numbers',
            href: '#exporterCreditRatingOther',
          }],
        };
      }
    }

    return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'pricing and risk',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        exporterCreditRating: submittedValue,
      },
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    exporterCreditRating: submittedValue,
  };

  await api.updateCreditRating(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

export default {
  getUnderWritingPricingAndRisk,
  getUnderWritingPricingAndRiskEdit,
  postUnderWritingPricingAndRisk,
};
