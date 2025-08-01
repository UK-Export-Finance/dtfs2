const CONSTANTS = require('../../constants');

/**
 * Get the first task in a all tasks
 * @param {Array} all task groups array
 * @returns {object} Task
 */
const getFirstTask = (tasks) => tasks[0].groupTasks[0];

/**
 * Get a task in a group by task ID
 * @param {Array} tasks in a group (groupTasks)
 * @param {string} task ID
 * @returns {object} Task
 */
const getTaskInGroupById = (groupTasks, taskId) => groupTasks.find((t) => t.id === taskId);

/**
 * Get a task in a group by task title
 * @param {Array} tasks in a group (groupTasks)
 * @param {string} task title
 * @returns {object} Task
 */
const getTaskInGroupByTitle = (groupTasks, title) => groupTasks.find((task) => task.title === title);

/**
 * Get a group by group ID
 * @param {Array} all task groups array
 * @param {number} group ID
 * @returns {object} Group
 */
const getGroupById = (allTaskGroups, groupId) => {
  const group = allTaskGroups.find((g) => g.id === groupId);

  return group;
};

/**
 * Get a group by group title
 * @param {Array} all task groups array
 * @param {string} group title
 * @returns {object} Group
 */
const getGroupByTitle = (allTaskGroups, title) => allTaskGroups.find(({ groupTitle }) => groupTitle === title);

/**
 * Check if a given task ID is the first task in a group
 * @param {string} task ID
 * @param {number} group ID
 * @returns {boolean}
 */
const isFirstTaskInAGroup = (taskId, groupId) => taskId === '1' && groupId > 1;

/**
 * Check if a given task ID and group ID is the first task in the first group
 * @param {string} task ID
 * @param {number} group ID
 * @returns {boolean}
 */
const isFirstTaskInFirstGroup = (taskId, groupId) => taskId === '1' && groupId === 1;

/**
 * Check if a group has all tasks completed
 * @param {Array} tasks in a group (groupTasks)
 * @returns {boolean}
 */
const groupHasAllTasksCompleted = (groupTasks = []) => {
  const totalTasks = groupTasks.length;

  const completedTasks = groupTasks.filter((task) => task.status === CONSTANTS.TASKS.STATUS.COMPLETED);

  if (completedTasks.length === totalTasks) {
    return true;
  }

  return false;
};

/**
 * Check if a task status is changing from 'To do' to 'Completed'
 * @param {string} task status changing from
 * @param {string} task status changing to
 * @returns {boolean}
 */
const taskIsCompletedImmediately = (statusFrom, statusTo) => {
  if (statusFrom === CONSTANTS.TASKS.STATUS.TO_DO && statusTo === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
  }

  return false;
};

/**
 * Check if the Adverse History Check task is completed.
 * @param {Array} all task groups array
 * @returns {boolean}
 */
const isAdverseHistoryTaskIsComplete = (allTaskGroups) => {
  const adverseGroup = getGroupByTitle(allTaskGroups, CONSTANTS.TASKS.GROUP_TITLES.ADVERSE_HISTORY);

  if (adverseGroup) {
    const { COMPLETE_ADVERSE_HISTORY_CHECK } = CONSTANTS.TASKS.MIA_ADVERSE_HISTORY_GROUP_TASKS;

    const adverseTask = getTaskInGroupByTitle(adverseGroup.groupTasks, COMPLETE_ADVERSE_HISTORY_CHECK);

    if (adverseTask?.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      return true;
    }
  }

  return false;
};

/**
 * Check if the Adverse History Check task is completed for an amendment
 * @param {Array} all task groups array
 * @returns {boolean}
 */
const hasAmendmentAdverseHistoryTaskCompleted = (allTaskGroups) => {
  const adverseGroup = getGroupByTitle(allTaskGroups, CONSTANTS.TASKS.GROUP_TITLES.ADVERSE_HISTORY);

  if (adverseGroup) {
    const { COMPLETE_ADVERSE_HISTORY_CHECK } = CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS;

    const adverseTask = getTaskInGroupByTitle(adverseGroup.groupTasks, COMPLETE_ADVERSE_HISTORY_CHECK);

    if (adverseTask?.status === CONSTANTS.TASKS_AMENDMENT.STATUS.COMPLETED) {
      return true;
    }
  }

  return false;
};

const isRiskAnalysisCompleted = (allTaskGroups) => {
  const approvalsGroup = getGroupByTitle(allTaskGroups, CONSTANTS.TASKS_AMENDMENT.GROUP_TITLES.APPROVALS);

  if (approvalsGroup) {
    const { COMPLETE_RISK_ANALYSIS } = CONSTANTS.TASKS_AMENDMENT.MANUAL_AMENDMENT_GROUP_4_TASKS;

    const riskTask = getTaskInGroupByTitle(approvalsGroup.groupTasks, COMPLETE_RISK_ANALYSIS);

    if (riskTask?.status === CONSTANTS.TASKS_AMENDMENT.STATUS.COMPLETED) {
      return true;
    }
  }

  return false;
};

/**
 * Check if the deal stage should be updated if:
 * - the deal is MIA
 * - and if the first task status is being changed to in progress or is completed immediately
 * @param {string} Deal submission type
 * @param {string} task ID
 * @param {number} group ID
 * @param {string} task status changing from
 * @param {string} task status changing to
 * @returns {boolean}
 */
const shouldUpdateDealStage = (submissionType, taskId, groupId, statusFrom, statusTo) => {
  const isMiaDeal = submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA;
  const firstTaskInFirstGroup = isFirstTaskInFirstGroup(taskId, groupId);
  const taskCompletedImmediately = taskIsCompletedImmediately(statusFrom, statusTo);

  if (isMiaDeal && firstTaskInFirstGroup && (statusTo === CONSTANTS.TASKS.STATUS.IN_PROGRESS || taskCompletedImmediately)) {
    return true;
  }

  return false;
};

module.exports = {
  getFirstTask,
  getTaskInGroupById,
  getTaskInGroupByTitle,
  getGroupById,
  getGroupByTitle,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  groupHasAllTasksCompleted,
  taskIsCompletedImmediately,
  isAdverseHistoryTaskIsComplete,
  shouldUpdateDealStage,
  isRiskAnalysisCompleted,
  hasAmendmentAdverseHistoryTaskCompleted,
};
