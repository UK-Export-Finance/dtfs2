const CONSTANTS = require('../../constants');

const getFirstTask = (tasks) =>
  tasks[0].groupTasks[0];

const getTaskInGroupById = (groupTasks, taskId) =>
  groupTasks.find((t) => t.id === taskId);

const getTaskInGroupByTitle = (groupTasks, title) =>
  groupTasks.find((task) => task.title === title);

const getGroupById = (allTaskGroups, groupId) => {
  const group = allTaskGroups.find((g) => g.id === groupId);

  return group;
};

const getGroupByTitle = (allTaskGroups, title) =>
  allTaskGroups.find(({ groupTitle }) => groupTitle === title);

const isFirstTaskInAGroup = (taskId, groupId) =>
  (taskId === '1' && groupId > 1);

const isFirstTaskInFirstGroup = (taskId, groupId) =>
  (taskId === '1' && groupId === 1);

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
* */
const taskIsCompletedImmediately = (statusFrom, statusTo) => {
  if (statusFrom === CONSTANTS.TASKS.STATUS.TO_DO
    && statusTo === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
  }

  return false;
};

/**
 * Get the Adverse History group and
 * check if the Adverse History Check task is completed.
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
 * Check if the deal is MIA
 * and if the first task status is being changed to in progress or is completed immediately
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
