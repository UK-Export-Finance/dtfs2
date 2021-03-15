const api = require('../api');

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);

  const { taskId } = tfmTaskUpdate;

  const originalTasks = deal.tfm.tasks;

  const modifiedTasks = originalTasks.map((t) => {
    let task = t;
    if (task.id === taskId) {
      task = {
        ...task,
        ...tfmTaskUpdate,
      };
    }

    return task;
  });

  const tasksUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  // // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, tasksUpdate);

  // TODO: add task to user.
  return updatedDeal;
};
exports.updateTfmTask = updateTfmTask;
