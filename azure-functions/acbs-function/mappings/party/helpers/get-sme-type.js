const CONSTANTS = require('../../../constants');

const getSmeType = (smeType) => {
  switch (smeType.toLowerCase()) {
    case CONSTANTS.DEAL.SME_TYPE.MICRO:
      return CONSTANTS.PARTY.SME_TYPE.MICRO;

    case CONSTANTS.DEAL.SME_TYPE.SMALL:
      return CONSTANTS.PARTY.SME_TYPE.SMALL;

    case CONSTANTS.DEAL.SME_TYPE.MEDIUM:
      return CONSTANTS.PARTY.SME_TYPE.MEDIUM;

    case CONSTANTS.DEAL.SME_TYPE.NOT_KNOWN:
      return CONSTANTS.PARTY.SME_TYPE.NOT_KNOWN;

    case CONSTANTS.DEAL.SME_TYPE.NON_SME:
      return CONSTANTS.PARTY.SME_TYPE.NON_SME;

    case CONSTANTS.DEAL.SME_TYPE.NOT_SME:
      return CONSTANTS.PARTY.SME_TYPE.NON_SME;

    default:
      return CONSTANTS.PARTY.SME_TYPE.NOT_KNOWN;
  }
};

module.exports = getSmeType;
