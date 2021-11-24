const { getTime } = require('date-fns');
const api = require('../api');
const CONSTANTS = require('../../constants');
const getAssigneeFullName = require('./get-assignee-full-name');
const {
  previousTaskIsComplete,
  isFirstTaskInFirstGroup,
  getGroup,
  getTask,
  canUpdateTask,
  isTaskComplete,
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

const updateTask = (allTaskGroups, groupId, taskIdToUpdate, taskUpdate) =>
  allTaskGroups.map((tGroup) => {
    let group = tGroup;
      console.log(taskIdToUpdate, taskUpdate);
    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        let task = t;

        if (task.id === taskIdToUpdate
          && task.groupId === groupId) {
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

const updateTasksCanEdit = async (allTaskGroups, groupId, taskIdToUpdate, deal, urlOrigin) => {
  const sendUpdatedEmailRequests = [];

  const taskGroups = allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t, index, array) => {
        const task = t;
        if (task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
          task.canEdit = false;
        } else if (isTaskComplete(allTaskGroups, group, task.id)) {
          if (task.id === taskIdToUpdate
            && task.groupId === groupId) {
            if (task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
              task.canEdit = false;
            }
          } else {
            if (task.groupId === 3 && task.id === '1') {
              for (let i = index + 1; i <= index + 2; i += 1) {
                const nextTask = array[i];
                nextTask.canEdit = true;
                nextTask.status = CONSTANTS.TASKS.STATUS.TO_DO;
                // Send task notification emails
                sendUpdatedEmailRequests.push(sendUpdatedTaskEmail(nextTask, deal, urlOrigin));
              }
            }
            // task can be started
            task.canEdit = true;
            task.status = CONSTANTS.TASKS.STATUS.TO_DO;
            // Send task notification emails
            sendUpdatedEmailRequests.push(sendUpdatedTaskEmail(task, deal, urlOrigin));
          }
        }
        console.log('task', task);
        return task;
      }),
    };
    console.log('group', group);
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
       console.log('updateeeeeeeeeee')
    return true;
  }

  return false;
};

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
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
  } = tfmTaskUpdate;

  const group = getGroup(allTasks, groupId);

  const originalTask = getTask(taskIdToUpdate, group.groupTasks);

  const statusFrom = originalTask.status;

  if (canUpdateTask(allTasks, group, taskIdToUpdate)) {
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

    const modifiedTasks = updateTask(allTasks, groupId, taskIdToUpdate, updatedTask);

    const modifiedTasksWithEditStatus = await updateTasksCanEdit(
      modifiedTasks,
      groupId,
      taskIdToUpdate,
      deal,
      urlOrigin,
    );
    console.log('modified with edit status', modifiedTasksWithEditStatus);

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
    console.log('status to', statusTo);
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
