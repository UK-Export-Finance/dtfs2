const CONSTANTS = require('../../../constants');

const getDelegationType = (submissionType) => {
  switch (submissionType) {
    case CONSTANTS.DEAL.SUBMISSION_TYPE.AIN:
      return 'A';

    case CONSTANTS.DEAL.SUBMISSION_TYPE.MIN:
      return 'M';

    default:
      return 'N';
  }
};

module.exports = getDelegationType;
