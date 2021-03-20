const CONSTANTS = require('../../../constants');

const getSmeType = (smeType) => {
  switch (smeType) {
    case CONSTANTS.DEAL.SME_TYPE.MICRO:
      return '70';

    case CONSTANTS.DEAL.SME_TYPE.SMALL:
      return '2';

    case CONSTANTS.DEAL.SME_TYPE.MEDIUM:
      return '3';

    case CONSTANTS.DEAL.SME_TYPE.NOT_KNOWN:
      return '4';

    case CONSTANTS.DEAL.SME_TYPE.NON_SME:
      return '5';

    default:
      return '70';
  }
};

module.exports = getSmeType;
