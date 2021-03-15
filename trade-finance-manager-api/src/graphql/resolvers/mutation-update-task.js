const { updateTfmTask } = require('../../v1/controllers/task.controller');

const updateTask = async ({ dealId, taskUpdate }) => {
  const update = await updateTfmTask(dealId, taskUpdate);
  return update;
};

module.exports = updateTask;
