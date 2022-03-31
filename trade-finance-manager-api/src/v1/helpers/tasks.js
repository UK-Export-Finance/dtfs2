const CONSTANTS = require('../../constants');

/**
 * Get the first task in a all tasks
 * @param {Array} all task groups array
 * @returns {Object} Task
 */
const getFirstTask = (tasks) =>
  tasks[0].groupTasks[0];

/**
 * Get a task in a group by task ID
 * @param {Array} tasks in a group (groupTasks)
 * @param {String} task ID
 * @returns {Object} Task
 */
const getTaskInGroupById = (groupTasks, taskId) =>
  groupTasks.find((t) => t.id === taskId);

/**
 * Get a task in a group by task title
 * @param {Array} tasks in a group (groupTasks)
 * @param {String} task title
 * @returns {Object} Task
 */
const getTaskInGroupByTitle = (groupTasks, title) =>
  groupTasks.find((task) => task.title === title);

/**
 * Get a group by group ID
 * @param {Array} all task groups array 
 * @param {Number} group ID
 * @returns {Object} Group
 */
const getGroupById = (allTaskGroups, groupId) => {
  const group = allTaskGroups.find((g) => g.id === groupId);

  return group;
};

/**
 * Get a group by group title
 * @param {Array} all task groups array 
 * @param {String} group title
 * @returns {Object} Group
 */
const getGroupByTitle = (allTaskGroups, title) =>
  allTaskGroups.find(({ groupTitle }) => groupTitle === title);

/**
 * Check if a given task ID is the first task in a group
 * @param {String} task ID
 * @param {Number} group ID
 * @returns {Boolean}
 */
const isFirstTaskInAGroup = (taskId, groupId) =>
  (taskId === '1' && groupId > 1);

/**
 * Check if a given task ID and group ID is the first task in the first group
 * @param {String} task ID
 * @param {Number} group ID
 * @returns {Boolean}
 */
const isFirstTaskInFirstGroup = (taskId, groupId) =>
  (taskId === '1' && groupId === 1);

/**
 * Check if a group has all tasks completed
 * @param {Array} tasks in a group (groupTasks)
 * @returns {Boolean}
 */
const groupHasAllTasksCompleted = (groupTasks = []) => {
  const totalTasks = groupTasks.length;

  const completedTasks = groupTasks.filter((task) =>
    task.status === CONSTANTS.TASKS.STATUS.COMPLETED);

  if (completedTasks.length === totalTasks) {
    return true;
  }

  return false;
};

/**
 * Check if a task status is changing from 'To do' to 'Completed'
 * @param {String} task status changing from
 * @param {String} task status changing to
 * @returns {Boolean}
 **/
const taskIsCompletedImmediately = (statusFrom, statusTo) => {
  if (statusFrom === CONSTANTS.TASKS.STATUS.TO_DO
    && statusTo === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
  }

  return false;
};

/**
 * Check if the Adverse History Check task is completed.
 * @param {Array} all task groups array
 * @returns {Boolean}
 * */
const isAdverseHistoryTaskIsComplete = (allTaskGroups) => {
  const adverseGroup = getGroupByTitle(allTaskGroups, CONSTANTS.TASKS.GROUP_TITLES.ADVERSE_HISTORY);

  if (adverseGroup) {
    const adverseTaskTitle = CONSTANTS.TASKS.MIA_ADVERSE_HISTORY_GROUP_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK;

    const adverseTask = getTaskInGroupByTitle(adverseGroup.groupTasks, adverseTaskTitle);

    if (adverseTask
      && adverseTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      return true;
    }
  }

  return false;
};

/**
 * Check if the deal stage should be updated if:
 * - the deal is MIA
 * - and if the first task status is being changed to in progress or is completed immediately
 * @param {String} Deal submission type
 * @param {String} task ID
 * @param {Number} group ID
 * @param {String} task status changing from
 * @param {String} task status changing to
 * @returns {Boolean}
 * */
const shouldUpdateDealStage = (submissionType, taskId, groupId, statusFrom, statusTo) => {
  const isMiaDeal = (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
  const firstTaskInFirstGroup = isFirstTaskInFirstGroup(taskId, groupId);
  const taskCompletedImmediately = taskIsCompletedImmediately(statusFrom, statusTo);

  if (isMiaDeal
    && firstTaskInFirstGroup
    && (statusTo === CONSTANTS.TASKS.STATUS.IN_PROGRESS || taskCompletedImmediately)) {
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
};
