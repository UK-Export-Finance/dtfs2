const api = require('../api');
const CONSTANTS = require('../../constants');

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);

  const {
    id: taskIdToUpdate,
    assignedTo,
  } = tfmTaskUpdate;

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

  const cleanTfmTask = {
    ...tfmTaskUpdate,
    assignedTo: {
      userFullName: newAssigneeFullName,
      userId: assignedUserId,
    },
  };

  const originalTasks = deal.tfm.tasks;

  let originalTaskAssignedUserId;

  const modifiedTasks = originalTasks.map((tGroup) => {
    let taskGroup = tGroup;
    taskGroup = {
      ...taskGroup,
      groupTasks: taskGroup.groupTasks.map((t) => {
        let task = t;
        if (task.id === taskIdToUpdate) {
          originalTaskAssignedUserId = task.assignedTo.userId;

          task = {
            ...task,
            ...cleanTfmTask,
          };
        }
        return task;
      }),
    };

    return taskGroup;
  });

  const tasksUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  // update tasks in deal
  await api.updateDeal(dealId, tasksUpdate);

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

  return cleanTfmTask;
};
exports.updateTfmTask = updateTfmTask;
