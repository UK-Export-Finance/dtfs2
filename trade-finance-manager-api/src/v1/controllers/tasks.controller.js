const api = require('../api');
const CONSTANTS = require('../../constants');
const now = require('../../now');

const updateHistory = ({
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
}) => ({
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
  timestamp: now(),
});

const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

const previousTaskIsComplete = (groupTasks, taskId) => {
  const previousTaskId = String(Number(taskId - 1));

  const previousTask = getTask(previousTaskId, groupTasks);

  if (!previousTask) {
    return true;
  }

  if (previousTask.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
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

const getParentGroupTasks = (allTaskGroups, groupId) => {
  const group = allTaskGroups.find((g) => g.id === groupId);

  return group.groupTasks;
};

const isFirstTask = (taskId) => taskId === '1';

const canUpdateTask = (taskId, groupTasks) => {
  if (isFirstTask(taskId)
      && !firstTaskIsComplete(groupTasks)) {
    return true;
  }

  if (!isFirstTask(taskId)
    && previousTaskIsComplete(groupTasks, taskId)) {
    return true;
  }

  return false;
};

const getNewAssigneeFullName = async (assignedUserId) => {
  let fullName;

  if (assignedUserId === CONSTANTS.TASKS.UNASSIGNED) {
    fullName = CONSTANTS.TASKS.UNASSIGNED;
  } else {
    const user = await api.findUserById(assignedUserId);
    const { firstName, lastName } = user;

    fullName = `${firstName} ${lastName}`;
  }

  return fullName;
};

const updateTask = (allTaskGroups, groupId, taskIdToUpdate, taskUpdate) =>
  allTaskGroups.map((tGroup) => {
    let group = tGroup;

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

const updateTasksCanEdit = (allTaskGroups, groupId, taskIdToUpdate) =>
  allTaskGroups.map((tGroup) => {
    let group = tGroup;

    group = {
      ...group,
      groupTasks: group.groupTasks.map((t) => {
        const task = t;

        if (task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
          task.canEdit = false;
        } else if (!isFirstTask(task.id)
          && previousTaskIsComplete(group.groupTasks, task.id)) {
          task.canEdit = true;

          if (task.id === taskIdToUpdate
            && task.groupId === groupId) {
            if (task.status === CONSTANTS.TASKS.STATUS.COMPLETED) {
              task.canEdit = false;
            }
          }
        }

        return task;
      }),
    };

    return group;
  });

const updateUserTasks = async (allTasks, userId) => {
  const tasksAssignedToUser = [];

  allTasks.map((taskGroup) =>
    taskGroup.groupTasks.map((task) => {
      if (task.assignedTo && task.assignedTo.userId === userId) {
        tasksAssignedToUser.push(task);
      }
      return task;
    }));

  const updatedUser = await api.updateUserTasks(userId, tasksAssignedToUser);
  return updatedUser.assignedTasks;
};

const updateOriginalAssigneeTasks = async (originalAssigneeUserId, updatedTaskId) => {
  const { assignedTasks: originalTaskAssigneeTasks } = await api.findUserById(originalAssigneeUserId);

  const modifiedOriginalTaskAssigneeTasks = originalTaskAssigneeTasks.filter((task) => task.id !== updatedTaskId);

  const updatedUser = await api.updateUserTasks(originalAssigneeUserId, modifiedOriginalTaskAssigneeTasks);

  return updatedUser.assignedTasks;
};

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);
  const allTasks = deal.tfm.tasks;

  const {
    id: taskIdToUpdate,
    groupId,
    assignedTo,
    status: statusTo,
    updatedBy,
  } = tfmTaskUpdate;

  const groupTasks = getParentGroupTasks(allTasks, groupId);

  const originalTask = getTask(taskIdToUpdate, groupTasks);

  const originalTaskAssignedUserId = originalTask.assignedTo.userId;

  if (canUpdateTask(taskIdToUpdate, groupTasks)) {
    const { userId: assignedUserId } = assignedTo;

    const newAssigneeFullName = await getNewAssigneeFullName(assignedUserId);

    const updatedTask = {
      id: taskIdToUpdate,
      groupId,
      status: statusTo,
      assignedTo: {
        userFullName: newAssigneeFullName,
        userId: assignedUserId,
      },
      lastEdited: now(),
    };

    const modifiedTasks = updateTask(allTasks, groupId, taskIdToUpdate, updatedTask);

    const modifiedTasksWithEditStatus = updateTasksCanEdit(modifiedTasks, groupId, taskIdToUpdate);

    const tfmHistoryUpdate = {
      tasks: [
        ...deal.tfm.history.tasks,
        updateHistory({
          statusFrom: originalTask.status,
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

    // update deal tasks and history
    await api.updateDeal(dealId, tfmDealUpdate);

    if (originalTaskAssignedUserId !== CONSTANTS.TASKS.UNASSIGNED) {
      await updateOriginalAssigneeTasks(originalTaskAssignedUserId, taskIdToUpdate);
    }

    if (assignedUserId !== CONSTANTS.TASKS.UNASSIGNED) {
      await updateUserTasks(modifiedTasks, assignedUserId);
    }

    return updatedTask;
  }

  return originalTask;
};

module.exports = {
  getTask,
  previousTaskIsComplete,
  firstTaskIsComplete,
  getParentGroupTasks,
  isFirstTask,
  canUpdateTask,
  getNewAssigneeFullName,
  updateTask,
  updateTasksCanEdit,
  updateUserTasks,
  updateOriginalAssigneeTasks,
  updateTfmTask,
};
