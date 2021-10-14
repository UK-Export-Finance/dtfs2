const { STATUS } = require('../../enums');

const hasRequiredItems = (answers) =>
  answers.filter((a) => !a.answer);

const isAutomaticCover = (answers) => {
  if (answers.every((a) => a.answer === true)) {
    return true;
  }

  if (answers.some((a) => a.answer === null)) {
    return null;
  }
  return false;
};

const eligibilityCriteriaStatus = (answers) => {
  const requiredCount = hasRequiredItems(answers).length;

  if (requiredCount > 0) {
    return STATUS.IN_PROGRESS;
  }

  if (requiredCount === 0) {
    return STATUS.COMPLETED;
  }

  return STATUS.NOT_STARTED;
};

const eligibilityCriteriaValidation = (answers) => ({
  required: hasRequiredItems(answers),
});

module.exports = {
  eligibilityCriteriaValidation,
  eligibilityCriteriaStatus,
  isAutomaticCover,
};

