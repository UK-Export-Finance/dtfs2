import api from '../../../api';
import {
  userIsInTeam,
} from '../../../helpers/user';
import {
  hasValue,
  containsNumber,
} from '../../../helpers/string';
import CONSTANTS from '../../../constants';

const getUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  return res.render('case/underwriting/pricing-and-risk/pricing-and-risk.njk', {
    userCanEdit: userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]),
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
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

const getUnderWritingLossGivenDefault = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/loss-given-default.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const postUnderWritingLossGivenDefault = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  let validationErrors;
  let errorMsg;

  const { lossGivenDefault } = req.body;

  // eslint-disable-next-line eqeqeq
  if (Number(lossGivenDefault) != lossGivenDefault
    || Number(lossGivenDefault) < 1
    || Number(lossGivenDefault) > 100) {
    errorMsg = 'Enter a value between 1 - 100';
  }

  if (!lossGivenDefault) {
    errorMsg = 'Enter a loss given default';
  }

  if (errorMsg) {
    validationErrors = {
      count: 1,
      errorList: {
        lossGivenDefault: {
          text: errorMsg,
          order: '1',
        },
      },
      summary: [{
        text: errorMsg,
        href: '#lossGivenDefault',
      }],
    };


    return res.render('case/underwriting/pricing-and-risk/loss-given-default.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'pricing and risk',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        lossGivenDefault,
      },
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    lossGivenDefault,
  };

  await api.updateLossGivenDefault(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

const getUnderWritingProbabilityOfDefault = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/probability-of-default.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const postUnderWritingProbabilityOfDefault = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  const { user } = req.session;
  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  if (!deal || !userCanEdit) {
    return res.redirect('/not-found');
  }

  let validationErrors;
  let errorMsg;

  const { probabilityOfDefault } = req.body;

  if (!probabilityOfDefault) {
    errorMsg = 'Enter a probability of default';
  }

  // eslint-disable-next-line eqeqeq
  if (Number(probabilityOfDefault) != probabilityOfDefault) {
    errorMsg = 'Enter a numeric value';
  }

  if (errorMsg) {
    validationErrors = {
      count: 1,
      errorList: {
        probabilityOfDefault: {
          text: errorMsg,
          order: '1',
        },
      },
      summary: [{
        text: errorMsg,
        href: '#probabilityOfDefault',
      }],
    };


    return res.render('case/underwriting/pricing-and-risk/probability-of-default.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'pricing and risk',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        probabilityOfDefault,
      },
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    probabilityOfDefault,
  };

  await api.updateProbabilityOfDefault(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};


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


export default {
  getUnderWritingPricingAndRisk,
  getUnderWritingPricingAndRiskEdit,
  postUnderWritingPricingAndRisk,
  getUnderWritingLossGivenDefault,
  postUnderWritingLossGivenDefault,
  getUnderWritingProbabilityOfDefault,
  postUnderWritingProbabilityOfDefault,
};
