const CONSTANTS = require('../../../constants');
const DEFAULTS = require('../../defaults');

const dealPricingAndRisk = (deal) => {
  const { dealType, submissionType, exporter } = deal;

  const pricingAndRisk = {
    lossGivenDefault: DEFAULTS.LOSS_GIVEN_DEFAULT,
  };

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    pricingAndRisk.exporterCreditRating = DEFAULTS.CREDIT_RATING.AIN;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    pricingAndRisk.probabilityOfDefault = exporter.probabilityOfDefault;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    pricingAndRisk.probabilityOfDefault = DEFAULTS.PROBABILITY_OF_DEFAULT;
  }

  return pricingAndRisk;
};

module.exports = dealPricingAndRisk;
