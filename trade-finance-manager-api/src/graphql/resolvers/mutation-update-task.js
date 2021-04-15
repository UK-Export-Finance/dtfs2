const { updateTfmTask } = require('../../v1/controllers/tasks.controller');

const updateTask = async ({ dealId, taskUpdate }) => {
  const update = await updateTfmTask(dealId, taskUpdate);
  return update;
};

module.exports = updateTask;
