const api = require('../../../../api');
const {
  hasValue,
  containsNumber,
} = require('../../../../helpers/string');
const lossGivenDefaultControllers = require('./loss-given-default');
const probabilityOfDefaultControllers = require('./probability-of-default');
const facilityRiskProfileControllers = require('./facility-risk-profile');
const {
  userCanEditGeneral,
} = require('./helpers');

const getUnderWritingPricingAndRisk = async (deal, user) => ({
  userCanEditGeneral: userCanEditGeneral(user),
  activePrimaryNavigation: 'manage work',
  activeSubNavigation: 'underwriting',
  deal: deal.dealSnapshot,
  tfm: deal.tfm,
  dealId: deal.dealSnapshot._id,
  user,
});

const getUnderWritingPricingAndRiskEdit = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  const userCanEdit = userCanEditGeneral(user);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
  });
};

const postUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  const { user } = req.session;

  if (!deal || !userCanEditGeneral(user)) {
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
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        exporterCreditRating: submittedValue,
      },
      dealId: deal.dealSnapshot._id,
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    exporterCreditRating: submittedValue,
  };

  await api.updateCreditRating(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getUnderWritingPricingAndRisk,
  getUnderWritingPricingAndRiskEdit,
  postUnderWritingPricingAndRisk,
  ...lossGivenDefaultControllers,
  ...probabilityOfDefaultControllers,
  ...facilityRiskProfileControllers,
};
