const getAssigneeFullName = require('../helpers/get-assignee-full-name');
const generateTaskDates = require('./generate-task-dates');

/**
 * Map user inputted task updated data into DB/schema format
 * @param {object} original task
 * @param {object} user inputted task update
 * @returns {Promise<object>} DB/schema formatted task object with extra task dates and full user name
 */
const mapTaskObject = async (originalTask, updateInput) => {
  const statusFrom = originalTask.status;

  const { id: taskIdToUpdate, groupId, assignedTo, status: statusTo } = updateInput;

  const { userId: assignedUserId } = assignedTo;

  const newAssigneeFullName = await getAssigneeFullName(assignedUserId);

  const taskObj = {
    ...originalTask,
    id: taskIdToUpdate,
    groupId,
    status: statusTo,
    previousStatus: statusFrom,
    assignedTo: {
      userFullName: newAssigneeFullName,
      userId: assignedUserId,
    },
    ...generateTaskDates(statusFrom, statusTo),
  };

  return taskObj;
};

module.exports = mapTaskObject;
