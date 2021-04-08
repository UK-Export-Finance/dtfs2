const api = require('../api');
const CONSTANTS = require('../../constants');
// const now = require('../../now');

// const updateHistory = ({
//   statusFrom,
//   statusTo,
//   assignedUserId,
//   updatedBy,
// }) => ({
//   statusFrom,
//   statusTo,
//   assignedUserId,
//   updatedBy,
//   timestamp: now(),
// });

const getTask = (taskId, tasks) =>
  tasks.find((t) => t.id === taskId);

const previousTaskIsComplete = (groupTasks, taskId) => {
  const previousTaskId = String(Number(taskId - 1));

  const previousTask = getTask(previousTaskId, groupTasks);

  if (!previousTask) {
    return true;
  }

  if (previousTask.status === 'Done') {
    return true;
  }

  return false;
};

const firstTaskIsComplete = (groupTasks) => {
  const firstTask = groupTasks.find((t) => t.id === '1');

  if (firstTask.status === 'Done') {
    return true;
  }

  return false;
};

const getTaskParentGroupTasks = (allTaskGroups, taskId) => {
  let groupTasks;

  allTaskGroups.map((group) => {
    const taskInGroup = getTask(taskId, group.groupTasks);

    if (taskInGroup) {
      groupTasks = [...group.groupTasks];
    }

    return null;
  });

  return groupTasks;
};

const isFirstTask = (taskId) => taskId === '1';

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);
  const allTasks = deal.tfm.tasks;

  const {
    id: taskIdToUpdate,
    assignedTo,
    status: statusTo,
    // updatedBy,
  } = tfmTaskUpdate;

  let originalTask;

  allTasks.find((group) =>
    group.groupTasks.find((task) => {
      if (task.id === taskIdToUpdate) {
        originalTask = task;
      }
      return task;
    }));

  const parentGroupTasks = getTaskParentGroupTasks(allTasks, taskIdToUpdate);

  const canUpdateTask = ((isFirstTask(taskIdToUpdate)
    && !firstTaskIsComplete(parentGroupTasks))
    || (!isFirstTask(taskIdToUpdate) && previousTaskIsComplete(parentGroupTasks, taskIdToUpdate)));

  if (canUpdateTask) {
    const { userId: assignedUserId } = assignedTo;

    let newAssigneeFullName;
    let assignedUser;

    if (assignedUserId === CONSTANTS.TASKS.UNASSIGNED) {
      newAssigneeFullName = CONSTANTS.TASKS.UNASSIGNED;
    } else {
      assignedUser = await api.findUserById(assignedUserId);
      const { firstName, lastName } = assignedUser;
      newAssigneeFullName = `${firstName} ${lastName}`;
    }

    const updatedTask = {
      id: taskIdToUpdate,
      status: statusTo,
      assignedTo: {
        userFullName: newAssigneeFullName,
        userId: assignedUserId,
      },
    };

    let originalTaskAssignedUserId;

    const modifiedTasks = allTasks.map((tGroup) => {
      let group = tGroup;

      group = {
        ...group,
        groupTasks: group.groupTasks.map((t) => {
          let task = t;

          if (task.id === taskIdToUpdate) {
            originalTaskAssignedUserId = task.assignedTo.userId;

            task = {
              ...task,
              ...updatedTask,
            };
          }

          return task;
        }),
      };

      return group;
    });

    const modifiedTasksWithEditStatus = modifiedTasks.map((tGroup) => {
      let group = tGroup;

      group = {
        ...group,
        groupTasks: group.groupTasks.map((t) => {
          const task = t;

          if (task.status === 'Done') {
            task.canEdit = false;
          }

          if (!isFirstTask(task.id)
            && previousTaskIsComplete(group.groupTasks, task.id)) {
            task.canEdit = true;

            if (task.id === taskIdToUpdate) {
              if (task.status === 'Done') {
                task.canEdit = false;
              }
            }
          }

          return task;
        }),
      };

      return group;
    });

    // TODO add date to the task object as well as history
    //
    // TODO for some reason, adding updateHistory() here, breaks things
    //
    const tfmHistoryUpdate = {
      tasks: [
        ...deal.tfm.history.tasks,
        // {
        //   ...updateHistory({
        //     statusFrom: originalTask.status,
        //     statusTo,
        //     assignedUserId,
        //     updatedBy,
        //   }),
        // },
      ],
    };

    const tfmDealUpdate = {
      tfm: {
        history: tfmHistoryUpdate,
        tasks: modifiedTasksWithEditStatus,
      },
    };

    // update tasks in deal
    await api.updateDeal(dealId, tfmDealUpdate);

    if (originalTaskAssignedUserId !== CONSTANTS.TASKS.UNASSIGNED) {
      // update original assignee's tasks
      const { assignedTasks: originalTaskAssigneeTasks } = await api.findUserById(originalTaskAssignedUserId);

      const modifiedOriginalTaskAssigneeTasks = originalTaskAssigneeTasks.filter((task) => task.id !== taskIdToUpdate);

      await api.updateUserTasks(originalTaskAssignedUserId, modifiedOriginalTaskAssigneeTasks);
    }

    if (assignedUserId !== CONSTANTS.TASKS.UNASSIGNED) {
      // update new assignee's tasks

      const tasksAssignedToUser = [];

      modifiedTasks.map((taskGroup) =>
        taskGroup.groupTasks.map((task) => {
          if (task.assignedTo.userId === assignedUserId) {
            tasksAssignedToUser.push(task);
          }
          return task;
        }));

      await api.updateUserTasks(assignedUserId, tasksAssignedToUser);
    }

    return updatedTask;
  }

  return originalTask;
};

exports.updateTfmTask = updateTfmTask;
