const { STATUS } = require('../../enums');

const requiredAnswers = (answers) =>
  answers.filter((a) => a.answer === null);

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
  const count = answers.length;
  const requiredCount = requiredAnswers(answers).length;

  if (requiredCount === count) {
    return STATUS.NOT_STARTED;
  }

  if (requiredCount === 0) {
    return STATUS.COMPLETED;
  }

  return STATUS.IN_PROGRESS;
};

const eligibilityCriteriaValidation = (answers) => ({
  required: hasRequiredItems(answers),
});

module.exports = {
  eligibilityCriteriaValidation,
  eligibilityCriteriaStatus,
  isAutomaticCover,
};

