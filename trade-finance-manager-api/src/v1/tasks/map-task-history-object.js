const { getTime } = require('date-fns');

const mapTaskHistoryObject = ({
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
}) => ({
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
  timestamp: getTime(new Date()),
});

module.exports = mapTaskHistoryObject;
