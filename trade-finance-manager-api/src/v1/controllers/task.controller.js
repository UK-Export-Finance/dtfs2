const api = require('../api');
const CONSTANTS = require('../../constants');

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);

  const {
    id: taskIdToUpdate,
    assignedTo,
  } = tfmTaskUpdate;

  const { userId: assignedUserId } = assignedTo;

  let userFullName;

  if (assignedUserId === CONSTANTS.TASKS.UNASSIGNED) {
    userFullName = CONSTANTS.TASKS.UNASSIGNED;
  } else {
    const user = await api.findUserById(assignedUserId);
    const { firstName, lastName } = user;
    userFullName = `${firstName} ${lastName}`;
  }

  const cleanTfmTask = {
    ...tfmTaskUpdate,
    assignedTo: {
      userFullName,
      userId: assignedUserId,
    },
  };

  const originalTasks = deal.tfm.tasks;

  const modifiedTasks = originalTasks.map((tGroup) => {
    let taskGroup = tGroup;
    taskGroup = {
      ...taskGroup,
      groupTasks: taskGroup.groupTasks.map((t) => {
        let task = t;
        if (task.id === taskIdToUpdate) {
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

  // eslint-disable-next-line no-underscore-dangle
  await api.updateDeal(dealId, tasksUpdate);

  // TODO: if going from assigned to unassigned, remove from previous users's profile.

  // TODO update for groups
  const userAssignedTasks = modifiedTasks.filter((t) =>
    t.assignedTo && t.assignedTo.userId === assignedUserId);

  await api.updateUserTasks(assignedUserId, userAssignedTasks);

  return cleanTfmTask;
};
exports.updateTfmTask = updateTfmTask;
