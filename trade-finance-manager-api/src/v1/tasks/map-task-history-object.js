const { getTime } = require('date-fns');

/**
 * Assign multiple group tasks to a user
 * @param {String} deal ID
 * @param {Array} array of group titles that the should be assigned to the user
 * @param {String} assigned user ID
 * @param {String} user ID of the person updating the task
 * @returns {Object} all params and additional timestamp
 */
const mapTaskHistoryObject = ({ statusFrom, statusTo, assignedUserId, updatedBy }) => ({
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
  timestamp: getTime(new Date()),
});

module.exports = mapTaskHistoryObject;
