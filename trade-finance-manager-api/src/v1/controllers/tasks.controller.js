const api = require('../api');
const CONSTANTS = require('../../constants');
const {
  getGroupById,
  getTaskInGroupById,
  isAdverseHistoryTaskIsComplete,
  shouldUpdateDealStage,
} = require('../helpers/tasks');
const mapTaskObject = require('../tasks/map-task-object');
const mapTaskHistoryObject = require('../tasks/map-task-history-object');
const {
  previousTaskIsComplete,
  taskCanBeEditedWithoutPreviousTaskComplete,
  handleTaskEditFlagAndStatus,
} = require('../tasks/tasks-edit-logic');
const sendUpdatedTaskEmail = require('./task-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

/**
* Update a task in the task's group.
* */
const updateTask = (allTaskGroups, taskUpdate) =>
  allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        let task = t;

        if (task.id === taskUpdate.id
          && task.groupId === taskUpdate.groupId) {
          task = {
            ...task,
            ...taskUpdate,
          };
        }

        return task;
      }),
    };

    return group;
  });

/**
 * Update all tasks canEdit flag and status
 * Depending on what task has been changed.
 * */
const updateAllTasks = async (allTaskGroups, groupId, taskUpdate, deal, urlOrigin) => {
  let taskGroups = allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        const task = t;

        const isTaskThatIsBeingUpdated = (
          task.id === taskUpdate.id
          && task.groupId === taskUpdate.groupId);

        const {
          updatedTask,
          emailsArray,
        } = handleTaskEditFlagAndStatus(
          allTaskGroups,
          group,
          task,
          isTaskThatIsBeingUpdated,
        );

        return updatedTask;
      }),
    };

    return group;
  });

  /**
   * If 'Adverse History Check' task is completed
   * All tasks in the Underwriting Group Task become unlocked/able to be started
   * */
  const canUnlockUnderWritingGroupTasks = isAdverseHistoryTaskIsComplete(taskGroups);

  if (canUnlockUnderWritingGroupTasks) {
    taskGroups = taskGroups.map((g) => {
      const group = g;

      if (group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING) {
        group.groupTasks = group.groupTasks.map((task) => {
          const isTaskThatIsBeingUpdated = (
            task.id === taskUpdate.id
            && task.groupId === taskUpdate.groupId);

          const shouldUpdate = (!isTaskThatIsBeingUpdated
            && !task.canEdit
            && task.status === CONSTANTS.TASKS.STATUS.CANNOT_START);

          if (shouldUpdate) {
            return {
              ...task,
              canEdit: true,
              status: CONSTANTS.TASKS.STATUS.TO_DO,
            };
          }
          return task;
        });
      }

      return group;
    });
  }

  /**
   * Construct an array of email promises
   * From the array of tasks that need email notifications ('Task is ready to start')
   * */
  /*
  const emailPromises = [];

  emailsArray.forEach((task) => {
    emailPromises.push(sendUpdatedTaskEmail(
      task,
      deal,
      urlOrigin,
    ))
  });

  await Promise.all(emailPromises);
  */
  return taskGroups;
};

/**
 * Function that is first triggered. This:
 * - Gets the deal and all tasks.
 * - Maps the taskUpdate input into schema format, adding dates.
 * - Finds the group the task belongs to and updates it.
 * - Maps over all tasks and updates their status/canEdit flag.
 * - Updates tfm.history.tasks.
 * - Change the TFM dealStage (if deal is MIA and taskUpdate is first task)
 * - Updates the deal.
 * */
// TODO ^^^ ADD send emails.
const updateTfmTask = async (dealId, taskUpdate) => {
  const unmappedDeal = await api.findOneDeal(dealId);
  const deal = mapSubmittedDeal(unmappedDeal);

  const allTasks = deal.tfm.tasks;

  const {
    id: taskIdToUpdate,
    groupId,
    assignedTo,
    status: statusTo,
    updatedBy,
    urlOrigin,
  } = taskUpdate;

  const group = getGroupById(allTasks, groupId);
  const originalTask = getTaskInGroupById(group.groupTasks, taskIdToUpdate);
  const statusFrom = originalTask.status;

  const updatedTask = await mapTaskObject(originalTask, taskUpdate, statusFrom);

  const canUpdateTask = (
    previousTaskIsComplete(allTasks, group, updatedTask.id)
    || taskCanBeEditedWithoutPreviousTaskComplete(group, updatedTask));

  if (canUpdateTask) {
    /**
     * Update the task in the array
     * */
    const modifiedTasks = updateTask(allTasks, updatedTask);

    /**
     * Map over every task in all groups and
     * update other tasks so they can be started.
     * E.g If task 1 is completed, task 2 can then be started.
     * Some other special conditions are in here:
     * - e.g if X task is completed, an entire group of tasks can be started.
     * */
    const modifiedTasksWithEditStatus = await updateAllTasks(
      modifiedTasks,
      groupId,
      updatedTask,
      deal,
      urlOrigin,
    );

    /**
     * Update TFM history.tasks
     * */
    const tfmHistoryUpdate = {
      tasks: [
        mapTaskHistoryObject({
          taskId: taskIdToUpdate,
          groupId,
          statusFrom,
          statusTo,
          assignedUserId: assignedTo.userId,
          updatedBy,
        }),
      ],
    };

    /**
     * Construct TFM update object
     * */
    const tfmDealUpdate = {
      tfm: {
        history: tfmHistoryUpdate,
        tasks: modifiedTasksWithEditStatus,
      },
    };

    /**
     * If the deal is MIA
     * and the first task status is being changed to in progress or is completed immediately,
     * the TFM deal stage needs to change to 'in progress'.
     * */
    const updateDealStage = shouldUpdateDealStage(
      deal.submissionType,
      taskIdToUpdate,
      groupId,
      statusFrom,
      statusTo,
    );

    if (updateDealStage) {
      tfmDealUpdate.tfm.stage = CONSTANTS.DEALS.DEAL_STAGE_TFM.IN_PROGRESS;
    }

    /**
     * Update the deal
     * */
    await api.updateDeal(dealId, tfmDealUpdate);

    return updatedTask;
  }

  return originalTask;
};

module.exports = {
  updateTask,
  updateAllTasks,
  updateTfmTask,
};
