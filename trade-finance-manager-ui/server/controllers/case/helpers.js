const CONSTANTS = require('../../constants');

const getGroup = (groupId, allTasks) =>
  allTasks.find((group) => group.id === groupId);

const getTask = (groupId, taskId, tasks) => {
  const group = getGroup(groupId, tasks);

  if (group) {
    const task = group.groupTasks.find((t) => t.id === taskId);

    if (!task) {
      return null;
    }

    return task;
  }

  return null;
};

/**
 * @param {Object} deal
 * @param {Array} userTeam
 * @returns {Boolean}
 * function to show amendment button
 * checks submissionType, tfm status and if PIM user
 */
const showAmendmentButton = (deal, userTeam) => {
  const acceptableSubmissionType = [CONSTANTS.DEAL.SUBMISSION_TYPE.AIN, CONSTANTS.DEAL.SUBMISSION_TYPE.MIN];
  const acceptableUser = 'PIM';
  const acceptableStatus = [CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED];

  if (acceptableSubmissionType.includes(deal.dealSnapshot.submissionType) && userTeam.includes(acceptableUser)
    && acceptableStatus.includes(deal.tfm.stage)) {
    return true;
  }
  return false;
};

module.exports = {
  getGroup,
  getTask,
  showAmendmentButton,
};
