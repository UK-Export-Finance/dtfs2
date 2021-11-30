const CONSTANTS = require('../../constants');

const getFirstTask = (tasks) =>
  tasks[0].groupTasks[0];

const getTaskInGroup = (taskId, groupTasks) =>
  groupTasks.find((t) => t.id === taskId);

const getTaskInGroupByTitle = (groupTasks, title) =>
  groupTasks.find((task) => task.title === title);

const getGroupById = (allTaskGroups, groupId) => {
  const group = allTaskGroups.find((g) => g.id === groupId);

  return group;
};

const getGroupByTitle = (allTaskGroups, title) =>
  allTaskGroups.find(({ groupTitle }) => groupTitle === title);

const isFirstTask = (taskId) => taskId === '1';

const isFirstTaskInAGroup = (taskId, groupId) =>
  (taskId === '1' && groupId > 1);

const isFirstTaskInFirstGroup = (taskId, groupId) =>
  (taskId === '1' && groupId === 1);

const previousTaskIsComplete = (allTaskGroups, group, taskId) => {
  if (isFirstTaskInFirstGroup(taskId, group.id)) {
    // no other tasks/groups before this task, so previous task is irrelevant
    return true;
  }

  if (isFirstTaskInAGroup(taskId, group.id)) {
    // check the last (previous) task in the previous group
    const previousGroupId = group.id - 1;
    const previousGroup = getGroupById(allTaskGroups, previousGroupId);

    const totalTasksInPreviousGroup = previousGroup.groupTasks.length;
    const lastTaskInPreviousGroup = previousGroup.groupTasks[totalTasksInPreviousGroup - 1];

    if (lastTaskInPreviousGroup.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      return true;
    }
  } else {
    // check the previous task in the current group
    const previousTaskId = String(Number(taskId - 1));

    const previousTask = getTaskInGroup(previousTaskId, group.groupTasks);

    if (previousTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      return true;
    }
  }

  return false;
};

const taskCanBeEdited = (
  allTaskGroups,
  group,
  taskUpdate,
) => {
  if (previousTaskIsComplete(allTaskGroups, group, taskUpdate.id)) {
    return true;
  }

  return false;
};

const firstTaskIsComplete = (groupTasks) => {
  const firstTask = groupTasks.find((t) => t.id === '1');

  if (firstTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
  }

  return false;
};

const canUpdateTask = (allTaskGroups, group, taskUpdate) => {
  if (taskCanBeEdited(allTaskGroups, group, taskUpdate)) {
    return true;
  }

  return false;
};

const canActuallyUpdateTask = (allTaskGroups, taskUpdate) => {
  // todo
};

module.exports = {
  getFirstTask,
  getTaskInGroup,
  getTaskInGroupByTitle,
  getGroupById,
  getGroupByTitle,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  previousTaskIsComplete,
  taskCanBeEdited,
  firstTaskIsComplete,
  isFirstTask,
  canUpdateTask,
};
