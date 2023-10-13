const { updateTfmTask } = require('../../v1/controllers/tasks.controller');

const updateTask = async ({ dealId, taskUpdate }) => {
  const { groupId, id: taskId } = taskUpdate;
  const update = await updateTfmTask({ dealId, groupId, taskId, taskUpdate });
  return update;
};

module.exports = updateTask;
