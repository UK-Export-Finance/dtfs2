const CONSTANTS = require('../../../constants');
const bssEmailVariables = require('./bss-email-variables');

const commonEmailVars = (deal) => {
  const { ukefDealId, bankInternalRefName, maker, exporter } = deal;

  const { firstname, lastName } = maker;

  const base = {
    recipientName: `${firstname} ${lastName}`,
    exporterName: exporter.companyName,
    bankReferenceNumber: bankInternalRefName,
    ukefDealId,
  };

  return base;
};

const generateMiaConfirmationEmailVars = (deal, facilityLists) => {
  const { dealType } = deal;

  const baseEmailVars = commonEmailVars(deal);

  switch (dealType) {
    case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
      return {
        ...baseEmailVars,
        ...bssEmailVariables(deal, facilityLists),
      };

    case CONSTANTS.DEALS.DEAL_TYPE.GEF:
      return baseEmailVars;

    default:
      return {};
  }
};

module.exports = {
  commonEmailVars,
  generateMiaConfirmationEmailVars,
};
