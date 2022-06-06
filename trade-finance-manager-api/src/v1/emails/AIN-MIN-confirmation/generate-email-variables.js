const CONSTANTS = require('../../../constants');
const gefEmailVariables = require('./gef-email-variables');
const bssEmailVariables = require('./bss-email-variables');

const generateAinMinConfirmationEmailVars = async (deal, facilityLists) => {
  const { dealType } = deal;

  switch (dealType) {
    case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
      return bssEmailVariables(deal, facilityLists);

    case CONSTANTS.DEALS.DEAL_TYPE.GEF:
      // eslint-disable-next-line no-return-await
      return await gefEmailVariables(deal, facilityLists);

    default:
      return {};
  }
};

module.exports = generateAinMinConfirmationEmailVars;
