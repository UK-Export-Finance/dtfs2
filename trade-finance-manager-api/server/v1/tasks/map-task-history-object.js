const { getTime } = require('date-fns');

/**
 * Assign multiple group tasks to a user
 * @param {string} deal ID
 * @param {Array} array of group titles that the should be assigned to the user
 * @param {string} assigned user ID
 * @param {string} user ID of the person updating the task
 * @returns {object} all params and additional timestamp
 */
const mapTaskHistoryObject = ({ statusFrom, statusTo, assignedUserId, updatedBy }) => ({
  statusFrom,
  statusTo,
  assignedUserId,
  updatedBy,
  timestamp: getTime(new Date()),
});

module.exports = mapTaskHistoryObject;
