const api = require('../api');

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);

  const {
    id: taskId,
    userId,
  } = tfmTaskUpdate;

  const cleanTfmTask = {
    ...tfmTaskUpdate,
  };
  delete cleanTfmTask.userId;

  const originalTasks = deal.tfm.tasks;

  const modifiedTasks = originalTasks.map((t) => {
    let task = t;
    if (task.id === taskId) {
      task = {
        ...task,
        ...cleanTfmTask,
      };
    }

    return task;
  });

  const tasksUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  await api.updateDeal(dealId, tasksUpdate);

  const userAssignedTasks = modifiedTasks.filter((t) => t.assignedTo === userId);

  await api.updateUserTasks(userId, userAssignedTasks);

  return cleanTfmTask;
};
exports.updateTfmTask = updateTfmTask;
