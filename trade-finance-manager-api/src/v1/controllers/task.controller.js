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

const taskCanBeAssigned = (allTasks, taskIdToUpdate) => {
  const parentGroup = allTasks.find((group) => {
    if (group.groupTasks.find((task) => task.id === taskIdToUpdate)) {
      return group;
    }

    return group;
  });

  const groupHasOtherTaskInProgress = parentGroup.groupTasks.find((task) =>
    (task.id !== taskIdToUpdate
    && task.status === 'In progress'));

  if (groupHasOtherTaskInProgress) {
    return false;
  }

  return true;
};

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

  if (taskCanBeAssigned(allTasks, taskIdToUpdate)) {
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
      let taskGroup = tGroup;
      taskGroup = {
        ...taskGroup,
        groupTasks: taskGroup.groupTasks.map((t) => {
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

      return taskGroup;
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
        tasks: modifiedTasks,
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
