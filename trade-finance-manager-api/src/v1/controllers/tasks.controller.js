const api = require('../api');
const CONSTANTS = require('../../constants');
const { getGroupById, getTaskInGroupById, isAdverseHistoryTaskIsComplete, shouldUpdateDealStage } = require('../helpers/tasks');
const mapTaskObject = require('../tasks/map-task-object');
const mapTaskHistoryObject = require('../tasks/map-task-history-object');
const { previousTaskIsComplete, taskCanBeEditedWithoutPreviousTaskComplete, handleTaskEditFlagAndStatus } = require('../tasks/tasks-edit-logic');
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

        if (task.id === taskUpdate.id && task.groupId === taskUpdate.groupId) {
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
const updateAllTasks = async (allTaskGroups, groupId, taskUpdate, statusFrom, deal, urlOrigin) => {
  const taskEmailsToSend = [];

  let taskGroups = allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        const task = t;

        const isTaskThatIsBeingUpdated = task.id === taskUpdate.id && task.groupId === taskUpdate.groupId;

        const { updatedTask, sendEmail } = handleTaskEditFlagAndStatus(allTaskGroups, group, task, isTaskThatIsBeingUpdated);

        if (isTaskThatIsBeingUpdated) {
          updatedTask.history.push(
            mapTaskHistoryObject({
              statusFrom,
              statusTo: taskUpdate.status,
              assignedUserId: taskUpdate.assignedTo.userId,
              updatedBy: taskUpdate.updatedBy,
            }),
          );
        }

        if (sendEmail) {
          taskEmailsToSend.push(updatedTask);
        }

        return updatedTask;
      }),
    };

    return group;
  });

  /**
   * If 'Complete an adverse history check' task is completed
   * All tasks in the Underwriting Group become unlocked and are able to be started
   * */
  const canUnlockUnderWritingGroupTasks = isAdverseHistoryTaskIsComplete(taskGroups);

  if (canUnlockUnderWritingGroupTasks) {
    taskGroups = taskGroups.map((g) => {
      const group = g;

      if (group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING) {
        group.groupTasks = group.groupTasks.map((task) => {
          const isTaskThatIsBeingUpdated = task.id === taskUpdate.id && task.groupId === taskUpdate.groupId;

          // add the task to list of emails to be sent
          const shouldSendEmail = !isTaskThatIsBeingUpdated && !task.emailSent;
          if (shouldSendEmail) {
            taskEmailsToSend.push(task);
          }

          // unlock the task
          const shouldUnlock = !isTaskThatIsBeingUpdated && !task.canEdit && task.status === CONSTANTS.TASKS.STATUS.CANNOT_START;

          if (shouldUnlock) {
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
   * Send emails for each task in the emails array
   * ('Task is ready to start')
   * */
  const emailPromises = [];

  taskEmailsToSend.forEach((task) => {
    emailPromises.push(sendUpdatedTaskEmail(task, deal, urlOrigin));
  });

  const emailsResponse = await Promise.all(emailPromises);

  /**
   * Add emailSent=true flag to each task that successfully sent an email
   * */
  const tasksToAddEmailSentFlag = [];
  emailsResponse.forEach((response, index) => {
    if (!response.errors) {
      tasksToAddEmailSentFlag.push(taskEmailsToSend[index]);
    }
  });

  taskGroups = taskGroups.map((g) => {
    const group = g;

    const groupHasTaskToUpdate = tasksToAddEmailSentFlag.find((task) => task.groupId === group.id);

    if (groupHasTaskToUpdate) {
      group.groupTasks = group.groupTasks.map((t) => {
        const task = t;

        const taskShouldAddEmailSentFlag = tasksToAddEmailSentFlag.find((taskForEmail) => taskForEmail.id === task.id);

        if (taskShouldAddEmailSentFlag) {
          task.emailSent = true;
        }

        return task;
      });
    }

    return group;
  });

  return taskGroups;
};

/**
 * Function that is first triggered. This:
 * - Gets the deal and all tasks.
 * - Maps the taskUpdate input into schema format, adding dates.
 * - Finds the group the task belongs to and updates the task in that group.
 * - Checks if the task can be updated.
 * - Maps over all tasks in every group and updates their status/canEdit flag.
 * - If previous task is complete, a sendEmail flag for that task is returned.
 * - If the task is the task that is being updated (by user), task.history is updated.
 * - Sends emails ('task is ready to start') for any tasks that return sendEmail flag.
 * - Adds emailSent flag to any task that successfully sent an email.
 * - Change the TFM dealStage (if deal is MIA and taskUpdate is first task).
 * - Updates the deal.
 * */
const updateTfmTask = async (dealId, taskUpdate) => {
  const unmappedDeal = await api.findOneDeal(dealId);
  const deal = mapSubmittedDeal(unmappedDeal);

  const allTasks = deal.tfm.tasks;

  const { id: taskIdToUpdate, groupId, status: statusTo, urlOrigin } = taskUpdate;

  const group = getGroupById(allTasks, groupId);
  const originalTask = getTaskInGroupById(group.groupTasks, taskIdToUpdate);
  const statusFrom = originalTask.status;

  const updatedTask = await mapTaskObject(originalTask, taskUpdate, statusFrom);

  const canUpdateTask = previousTaskIsComplete(allTasks, group, updatedTask.id) || taskCanBeEditedWithoutPreviousTaskComplete(group, updatedTask);

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
    const modifiedTasksWithEditStatus = await updateAllTasks(modifiedTasks, groupId, updatedTask, statusFrom, deal, urlOrigin);

    /**
     * Construct TFM update object
     * */
    const tfmDealUpdate = {
      tfm: {
        tasks: modifiedTasksWithEditStatus,
      },
    };

    /**
     * If the deal is MIA
     * and the first task status is being changed to in progress or is completed immediately,
     * the TFM deal stage needs to change to 'in progress'.
     * */
    const updateDealStage = shouldUpdateDealStage(deal.submissionType, taskIdToUpdate, groupId, statusFrom, statusTo);

    if (updateDealStage) {
      tfmDealUpdate.tfm.stage = CONSTANTS.DEALS.DEAL_STAGE_TFM.IN_PROGRESS_BY_UKEF;
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
