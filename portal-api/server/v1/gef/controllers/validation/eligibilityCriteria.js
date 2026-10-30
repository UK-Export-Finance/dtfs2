const CONSTANTS = require('../../../../constants');

const getAnsweredItems = (answers) => answers.filter(({ answer }) => answer === true || answer === false);

const isAutomaticCover = (answers) => {
  if (answers.every(({ answer }) => answer === true)) {
    return true;
  }

  if (answers.some(({ answer }) => answer === null)) {
    return false;
  }

  return false;
};

const eligibilityCriteriaStatus = (answers) => {
  const requiredCount = answers.length;
  const answeredCount = getAnsweredItems(answers).length;

  if (answeredCount === 0) {
    return CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED;
  }

  if (answeredCount === requiredCount) {
    return CONSTANTS.DEAL.DEAL_STATUS.COMPLETED;
  }

  return CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS;
};

module.exports = {
  getAnsweredItems,
  isAutomaticCover,
  eligibilityCriteriaStatus,
};
