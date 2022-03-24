const CONSTANTS = require('../../constants');
const {
  getGroupById,
  getTaskInGroupById,
  getTaskInGroupByTitle,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  groupHasAllTasksCompleted,
} = require('../helpers/tasks');

/**
* Check if a task's previous task is complete
* */
const previousTaskIsComplete = (allTaskGroups, group, taskId) => {
  if (isFirstTaskInFirstGroup(taskId, group.id)) {
    /**
     * No other tasks/groups if the task is
     * the first task in the first group.
     * Previous task is irrelevant
     * */
    return true;
  }

  if (isFirstTaskInAGroup(taskId, group.id)) {
    /**
     * Check that all tasks in the previous group are completed
     * */
    const previousGroupId = group.id - 1;
    const previousGroup = getGroupById(allTaskGroups, previousGroupId);

    const previousGroupHasAllTasksCompleted = groupHasAllTasksCompleted(previousGroup.groupTasks);

    if (previousGroupHasAllTasksCompleted) {
      return true;
    }

    return false;
  }

  /**
   * Check that the previous task in the current group is completed
   * */
  const previousTaskId = String(Number(taskId - 1));

  const previousTask = getTaskInGroupById(group.groupTasks, previousTaskId);

  if (previousTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
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
 * Where any tasks in the group can be completed regardless of
 * a previous task in that group.
 * This currently only applies to the Underwriting group
 * If required, can be easily extended for other groups.
 * */
const taskCanBeEditedWithoutPreviousTaskComplete = (group, task) => {
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
  const updatedTask = task;
  let sendEmail = false;

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
     * Therefore, if the task is locked:
     * - update the canEdit flag
     * - change status to 'To do'
     * - return sendEmail flag (to alert user that the task is ready)
     * */
    if (!isTaskThatIsBeingUpdated
      && task.status === CONSTANTS.TASKS.STATUS.CANNOT_START) {
      updatedTask.canEdit = true;
      updatedTask.status = CONSTANTS.TASKS.STATUS.TO_DO;

      if (!task.emailSent) {
        sendEmail = true;
      }
    }
  }

  /**
   * Some tasks/groups can have any task in the group edited,
   * without the previous task being completed.
   * */
  if (taskCanBeEditedWithoutPreviousTaskComplete(group, task)) {
    if (isTaskThatIsBeingUpdated) {
      if (task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
        updatedTask.canEdit = false;
      }
      return { updatedTask };
    }

    return { updatedTask };
  }

  return {
    updatedTask,
    sendEmail,
  };
};

module.exports = {
  previousTaskIsComplete,
  isTaskInUnderwritingGroup,
  taskCanBeEditedWithoutPreviousTaskComplete,
  handleTaskEditFlagAndStatus,
};
