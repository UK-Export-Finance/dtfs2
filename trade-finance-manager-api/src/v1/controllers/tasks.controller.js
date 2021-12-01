const { getTime } = require('date-fns');
const api = require('../api');
const CONSTANTS = require('../../constants');
const getAssigneeFullName = require('./get-assignee-full-name');
const {
  previousTaskIsComplete,
  taskCanBeEditedWithoutPreviousTaskComplete,
  isFirstTaskInFirstGroup,
  getGroupById,
  getGroupByTitle,
  getTaskInGroup,
  getTaskInGroupByTitle,
  handleTaskEditFlagAndStatus,
} = require('../helpers/tasks');
const sendUpdatedTaskEmail = require('./task-emails');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

const updateHistory = ({
  taskId,
  groupId,
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
}) => ({
  taskId,
  groupId,
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
  timestamp: getTime(new Date()),
});

const updateTask = (allTaskGroups,taskUpdate) =>
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
* Generate timestamps:
* - lastEdited
* - dateStarted
* - dateCompleted
* */
const generateTaskDates = (statusFrom, statusTo) => {
  const dates = {
    lastEdited: getTime(new Date()),
  };

  if (statusFrom === CONSTANTS.TASKS.STATUS.TO_DO) {
    dates.dateStarted = getTime(new Date());
  }

  if (statusTo === CONSTANTS.TASKS.STATUS.COMPLETED) {
    dates.dateCompleted = getTime(new Date());
  }

  return dates;
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

const updateTasksCanEdit = async (allTaskGroups, groupId, taskUpdate, deal, urlOrigin) => {
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
    taskGroups = taskGroups.map((group) => {
      if (group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING) {
        group.groupTasks = group.groupTasks.map((task) => {
          const isTaskThatIsBeingUpdated = (
            task.id === taskUpdate.id
            && task.groupId === taskUpdate.groupId);

          const shouldUpdate = (!isTaskThatIsBeingUpdated && !task.canEdit);

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

const isMIAdeal = (submissionType) =>
  submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA;

const taskIsCompletedImmediately = (statusFrom, statusTo) => {
  if (statusFrom === CONSTANTS.TASKS.STATUS.TO_DO
    && statusTo === CONSTANTS.TASKS.STATUS.COMPLETED) {
    return true;
  }

  return false;
};

const shouldUpdateDealStage = (submissionType, taskId, groupId, statusFrom, statusTo) => {
  const miaDeal = isMIAdeal(submissionType);
  const firstTaskInFirstGroup = isFirstTaskInFirstGroup(taskId, groupId);
  const taskCompletedImmediately = taskIsCompletedImmediately(statusFrom, statusTo);

  if (miaDeal
    && firstTaskInFirstGroup
    && (statusTo === CONSTANTS.TASKS.STATUS.IN_PROGRESS || taskCompletedImmediately)) {
    return true;
  }

  return false;
};

/**
 * Construct a new object from inputted/requested data
 * */
const mapTaskObject = async (originalTask, updateInput) => {
  const statusFrom = originalTask.status;

  const {
    id: taskIdToUpdate,
    groupId,
    assignedTo,
    status: statusTo,
    updatedBy,
    urlOrigin,
  } = updateInput;

  const { userId: assignedUserId } = assignedTo;

  const newAssigneeFullName = await getAssigneeFullName(assignedUserId);

  const taskObj = {
    ...originalTask,
    id: taskIdToUpdate,
    groupId,
    status: statusTo,
    previousStatus: statusFrom,
    assignedTo: {
      userFullName: newAssigneeFullName,
      userId: assignedUserId,
    },
    ...generateTaskDates(statusFrom, statusTo),
  };

  return taskObj;
};

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
  const originalTask = getTaskInGroup(taskIdToUpdate, group.groupTasks);
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
     * */
    const modifiedTasksWithEditStatus = await updateTasksCanEdit(
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
        updateHistory({
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
     * Check if we need to update the deal stage
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

/**
 * assignTeamTasksToOneUser is no longer consumed.
 * Leaving this here for potential future use.
 * */
const assignTeamTasksToOneUser = async (dealId, teamIds, userId) => {
  const deal = await api.findOneDeal(dealId);
  const allTaskGroups = deal.tfm.tasks;

  const newAssigneeFullName = await getAssigneeFullName(userId);

  let modifiedTasks = allTaskGroups;

  modifiedTasks = modifiedTasks.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        let task = t;

        if (teamIds.includes(task.team.id)) {
          task = {
            ...task,
            assignedTo: {
              userFullName: newAssigneeFullName,
              userId,
            },
          };
        }

        return task;
      }),
    };

    return group;
  });

  const tfmDealUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  await api.updateDeal(dealId, tfmDealUpdate);

  return modifiedTasks;
};

const assignGroupTasksToOneUser = async (dealId, groupTitlesToAssign, userId) => {
  const deal = await api.findOneDeal(dealId);
  const allTaskGroups = deal.tfm.tasks;

  const newAssigneeFullName = await getAssigneeFullName(userId);

  let modifiedTasks = allTaskGroups;

  modifiedTasks = modifiedTasks.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        let task = t;

        /**
         * Use group title instead of id.
         * This ensures that the functionality will still work
         * if the ordering is changed.
         * */
        if (groupTitlesToAssign.includes(group.groupTitle)) {
          task = {
            ...task,
            assignedTo: {
              userFullName: newAssigneeFullName,
              userId,
            },
          };
        }

        return task;
      }),
    };

    return group;
  });

  const tfmDealUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  await api.updateDeal(dealId, tfmDealUpdate);

  return modifiedTasks;
};

module.exports = {
  updateTask,
  generateTaskDates,
  updateTasksCanEdit,
  isMIAdeal,
  taskIsCompletedImmediately,
  shouldUpdateDealStage,
  updateTfmTask,
  assignTeamTasksToOneUser,
  assignGroupTasksToOneUser,
};
