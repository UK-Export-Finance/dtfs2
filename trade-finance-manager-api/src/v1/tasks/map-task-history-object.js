const { getTime } = require('date-fns');

const mapTaskHistoryObject = ({
  taskId,
  groupId,
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
}) => ({
  taskId,
  groupId,
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
  timestamp: getTime(new Date()),
});

module.exports = mapTaskHistoryObject;
