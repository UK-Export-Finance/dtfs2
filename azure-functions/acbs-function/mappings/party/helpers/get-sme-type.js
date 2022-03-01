const CONSTANTS = require('../../../constants');

const getSmeType = (smeType) => {
  switch (smeType.toLowerCase()) {
    case CONSTANTS.DEAL.SME_TYPE.MICRO:
      return '40';

    case CONSTANTS.DEAL.SME_TYPE.SMALL:
      return '50';

    case CONSTANTS.DEAL.SME_TYPE.MEDIUM:
      return '60';

    case CONSTANTS.DEAL.SME_TYPE.NOT_KNOWN:
      return '70';

    case CONSTANTS.DEAL.SME_TYPE.NON_SME:
      return '20';

    default:
      return '70';
  }
};

module.exports = getSmeType;
