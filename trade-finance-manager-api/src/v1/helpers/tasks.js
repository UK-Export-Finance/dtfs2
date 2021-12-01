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

/**
 * Check if a task is in the Underwriting group.
 * */
const isTaskInUnderwritingGroup = (group, taskTitle) => {
  const isUnderwritingGroupTitle = group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING;

  const taskTitleIsInGroup = getTaskInGroupByTitle(group.groupTasks, taskTitle);

  if (isUnderwritingGroupTitle && taskTitleIsInGroup) {
    return true;
  }

  return false;
};

/**
 * Rules/conditions for special task groups
 * Where the any tasks in the group can be completed regardless of
 * a previous task in that group.
 * This currently only applies to the Underwriting group
 * If required, can be easily extended for other groups.
 * */
const taskCanBeEditedWithoutPreviousTaskComplete = (group, task) => {
  const statusTo = task.status;
  const { previousStatus } = task;

  if (previousStatus === CONSTANTS.TASKS.STATUS.COMPLETED
    || previousStatus === CONSTANTS.TASKS.STATUS.CANNOT_START) {
    return false;
  }

  const taskIsInUnderwritingGroup = isTaskInUnderwritingGroup(
    group,
    task.title,
  );

  if (taskIsInUnderwritingGroup
    && task.canEdit) {
      return true;
  }

  return false;
};

/**
 * Rules/conditions for task.canEdit and task.status
 * When a task is updated, all tasks are mapped over and call this function.
 * */
const handleTaskEditFlagAndStatus = (
  allTaskGroups,
  group,
  task,
  isTaskThatIsBeingUpdated,
) => {
  let updatedTask = task;
  const emailsArray = [];

  /**
   * If a task is completed, it can no longer be edited.
   * Therefore return the existing task as it is
   * and prevent execution of other conditions below
   * */
  if (!isTaskThatIsBeingUpdated
    && task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return { updatedTask: task };
  }

  if (previousTaskIsComplete(allTaskGroups, group, task.id)) {
    /**
     * If the task we're mapping over is the task in the requested update,
     * Just return the updated task.
     * But, if the task is completed, mark as cannot edit.
     * */
    if (isTaskThatIsBeingUpdated) {
      if (updatedTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
        updatedTask.canEdit = false;
      }
      return { updatedTask };
    }

    /**
     * Otherwise, the task can be started - because the previous task is complete.
     * Therefore, update the canEdit flag and change status to 'To do'.
     * */
    if (!isTaskThatIsBeingUpdated) {
      updatedTask.canEdit = true;
      updatedTask.status = CONSTANTS.TASKS.STATUS.TO_DO;

      emailsArray.push(updatedTask);
    }
  }

  /**
   * Some tasks/groups can have any task in the group edited,
   * without the previous task being completed.
   * */
  if (taskCanBeEditedWithoutPreviousTaskComplete(group, task)) {
    if (isTaskThatIsBeingUpdated) {
      if (updatedTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
        updatedTask.canEdit = false;
      }
      return { updatedTask };
    }

    return { updatedTask };
  }

  return {
    updatedTask,
    emailsArray,
  };
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
  taskCanBeEditedWithoutPreviousTaskComplete,
  isFirstTask,
  handleTaskEditFlagAndStatus,
};
