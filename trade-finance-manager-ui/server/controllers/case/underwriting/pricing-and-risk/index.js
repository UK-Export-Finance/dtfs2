const api = require('../../../../api');
const { hasValue } = require('../../../../helpers/string');
const lossGivenDefaultControllers = require('./loss-given-default');
const probabilityOfDefaultControllers = require('./probability-of-default');
const facilityRiskProfileControllers = require('./facility-risk-profile');
const { userCanEditGeneral } = require('./helpers');
const { mapSelectedCreditRating } = require('../../../../helpers/map-selected-credit-rating');
const { mapOtherCreditRatings } = require('../../../../helpers/map-other-credit-ratings');

const getUnderWritingPricingAndRisk = (deal, user) => ({
  userCanEditGeneral: userCanEditGeneral(user),
  activePrimaryNavigation: 'manage work',
  activeSubNavigation: 'underwriting',
  deal: deal.dealSnapshot,
  tfm: deal.tfm,
  dealId: deal.dealSnapshot._id,
  user,
});

const label = 'Credit rating';

/**
 * Controller to get pricing and risk edit page
 * @async
 * @function getUnderWritingPricingAndRiskEdit
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders the pricing and risk edit page
 */
const getUnderWritingPricingAndRiskEdit = async (req, res) => {
  const dealId = req.params._id;
  const { userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  const { user } = req.session;

  const userCanEdit = userCanEditGeneral(user);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  // Map the selected credit rating to the appropriate variables for rendering the page
  const { goodSelected, acceptableSelected, otherSelected, otherCreditRatingValue } = mapSelectedCreditRating(deal?.tfm?.exporterCreditRating);

  // Only pass the saved rating to pre-select it if "Other" is actually selected; otherwise pass undefined so no option is marked selected
  const otherCreditRatings = await mapOtherCreditRatings(otherCreditRatingValue);

  if (!Array.isArray(otherCreditRatings) || !otherCreditRatings?.length) {
    console.error('getUnderWritingPricingAndRiskEdit - No credit ratings returned from the API.');
    return res.render('_partials/problem-with-service.njk', { user });
  }

  return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user: req.session.user,
    goodSelected,
    acceptableSelected,
    otherSelected,
    otherCreditRatings,
    otherCreditRatingValue,
    label,
  });
};

/**
 * Controller to post underwriting and risk
 * @async
 * @function postUnderWritingPricingAndRisk
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Redirects to the next page
 */
const postUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id;
  const { user, userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  if (!deal || !userCanEditGeneral(user)) {
    return res.redirect('/not-found');
  }

  let validationErrors;

  const otherCreditRatings = await mapOtherCreditRatings();

  if (!Array.isArray(otherCreditRatings) || !otherCreditRatings?.length) {
    console.error('postUnderWritingPricingAndRisk -No credit ratings returned from the API.');
    return res.render('_partials/problem-with-service.njk', { user });
  }

  const selectedOther = req.body.exporterCreditRating === 'Other';
  const otherValue = hasValue(req.body.exporterCreditRatingOther);

  // Only set the submitted value to the other value if the user has selected "Other" and provided a value for it
  const submittedValue = selectedOther && otherValue ? req.body.exporterCreditRatingOther : req.body.exporterCreditRating;

  const noOptionSelected = !hasValue(req.body.exporterCreditRating);

  const hasValidationError = (selectedOther && !otherValue) || noOptionSelected;

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
        summary: [
          {
            text: 'Enter a credit rating',
            href: '#exporterCreditRating',
          },
        ],
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
          summary: [
            {
              text: 'Enter a credit rating',
              href: '#exporterCreditRatingOther',
            },
          ],
        };
      }
    }

    // Map the selected credit rating to the appropriate variables for rendering the page with validation errors
    const { goodSelected, acceptableSelected, otherSelected, otherCreditRatingValue } = mapSelectedCreditRating(submittedValue);

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
      otherCreditRatings,
      goodSelected,
      acceptableSelected,
      otherSelected,
      otherCreditRatingValue,
      label,
    });
  }

  const update = {
    exporterCreditRating: submittedValue,
  };

  await api.updateCreditRating(dealId, update, userToken);

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
