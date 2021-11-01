const CONSTANTS = require('../../../constants');
const gefEmailVariables = require('./gef-email-variables');
const bssEmailVariables = require('./bss-email-variables');

const generateAinMinConfirmationEmailVars = (deal, facilityLists) => {
  const { dealType } = deal;

  switch (dealType) {
    case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
      return bssEmailVariables(deal, facilityLists);

    case CONSTANTS.DEALS.DEAL_TYPE.GEF:
      return gefEmailVariables(deal, facilityLists);

    default:
      return {};
  },
};

module.exports = generateAinMinConfirmationEmailVars;
