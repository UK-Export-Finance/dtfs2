const getAssigneeFullName = require('../helpers/get-assignee-full-name');
const generateTaskDates = require('./generate-task-dates');

/**
 * Construct a new object from inputted/requested data
 * */
const mapTaskObject = async (originalTask, updateInput) => {
  const statusFrom = originalTask.status;

  const {
    id: taskIdToUpdate,
    groupId,
    assignedTo,
    status: statusTo,
  } = updateInput;

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
