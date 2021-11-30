const { getTime } = require('date-fns');
const api = require('../api');
const CONSTANTS = require('../../constants');
const getAssigneeFullName = require('./get-assignee-full-name');
const {
  taskCanBeEdited,
  isFirstTaskInFirstGroup,
  getGroup,
  getGroupByTitle,
  getTaskInGroup,
  getTaskInGroupByTitle,
  canUpdateTask,
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

const updateTasksCanEdit = async (allTaskGroups, groupId, taskUpdate, deal, urlOrigin) => {
  const sendUpdatedEmailRequests = [];
  let adverseTaskIsComplete = false;

  const adverseGroup = getGroupByTitle(allTaskGroups, CONSTANTS.TASKS.GROUP_TITLES.ADVERSE_HISTORY);

  const underwritingGroup = getGroupByTitle(allTaskGroups, CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING);

  // TODO: rename to getTaskInGroupById
  const group = getGroup(allTaskGroups, groupId);

  const fullTask = getTaskInGroup(taskUpdate.id, group.groupTasks);

  const taskIsInUnderwritingGroup = getTaskInGroupByTitle(underwritingGroup.groupTasks, fullTask.title);

  if (adverseGroup) {
    const adverseTaskTitle = CONSTANTS.TASKS.MIA_ADVERSE_HISTORY_GROUP_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK;

    const adverseTask = getTaskInGroupByTitle(adverseGroup.groupTasks, adverseTaskTitle);

    if (adverseTask
      && adverseTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
      adverseTaskIsComplete = true;
    }
  }

  const taskGroupIsUnlocked = (taskIsInUnderwritingGroup && adverseTaskIsComplete)

  const taskGroups = allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        const task = t;

        const isTaskThatIsBeingUpdated = (
          task.id === taskUpdate.id
          && task.groupId === taskUpdate.groupId);

        if (task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
          task.canEdit = false;
          return task;
        }
        
        // TODO rename canUpdateTask to taskCanBeEdited ?
        // or just use previousTaskComplete
        if (canUpdateTask(
          allTaskGroups,
          group,
          task,
        )) {
          if (isTaskThatIsBeingUpdated) {
            return task;
          } else {
            // task can be started
            task.canEdit = true;
            task.status = CONSTANTS.TASKS.STATUS.TO_DO;
          }

          // Send task notification emails
          sendUpdatedEmailRequests.push(sendUpdatedTaskEmail(task, deal, urlOrigin));
        }

        if (taskGroupIsUnlocked
          && task.status !== CONSTANTS.TASKS.STATUS.IN_PROGRESS) {
          // task can be started
          task.canEdit = true;
          task.status = CONSTANTS.TASKS.STATUS.TO_DO;

          // TODO: emails - for each underwriting task that has 'to do' status
          // BUT only if has been changed from 'cannot start' to 'to do'.
        }

        return task;
      }),
    };

    return group;
  });

  await Promise.all(sendUpdatedEmailRequests);
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

  const group = getGroup(allTasks, groupId);

  const originalTask = getTaskInGroup(taskIdToUpdate, group.groupTasks);

  const statusFrom = originalTask.status;

  if (canUpdateTask(allTasks, group, taskUpdate)) {
    const { userId: assignedUserId } = assignedTo;

    const newAssigneeFullName = await getAssigneeFullName(assignedUserId);

    const updatedTask = {
      id: taskIdToUpdate,
      groupId,
      status: statusTo,
      assignedTo: {
        userFullName: newAssigneeFullName,
        userId: assignedUserId,
      },
      ...generateTaskDates(statusFrom, statusTo),
    };

    const modifiedTasks = updateTask(allTasks, updatedTask);
    
    const modifiedTasksWithEditStatus = await updateTasksCanEdit(
      modifiedTasks,
      groupId,
      taskUpdate,
      deal,
      urlOrigin,
    );

    const tfmHistoryUpdate = {
      tasks: [
        updateHistory({
          taskId: taskIdToUpdate,
          groupId,
          statusFrom,
          statusTo,
          assignedUserId,
          updatedBy,
        }),
      ],
    };

    const tfmDealUpdate = {
      tfm: {
        history: tfmHistoryUpdate,
        tasks: modifiedTasksWithEditStatus,
      },
    };

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

    await api.updateDeal(dealId, tfmDealUpdate);

    return updatedTask;
  }

  return originalTask;
};

/*
assignTeamTasksToOneUser is no longer consumed.
Leaving this here for potential future use.
*/
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

        // Use group title instead of id.
        // This ensures that the functionality will still work
        // if the ordering is changed.
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
