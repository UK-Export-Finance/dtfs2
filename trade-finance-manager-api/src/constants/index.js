const FACILITIES = require('./facilities');
const DEALS = require('./deals');
const TEAMS = require('./teams');
const TASKS = require('./tasks');
const TASKS_AMENDMENT = require('./tasks-amendment.constant');
const NDB_TASKS_AMENDMENT = require('./tasks-ndb-amendment.constant');
const EMAIL_TEMPLATE_IDS = require('./email-template-ids');
const DURABLE_FUNCTIONS = require('./durable-functions');
const ACTIVITY = require('./activity');
const CURRENCY = require('./currency.constant');

module.exports = {
  FACILITIES,
  DEALS,
  TEAMS,
  TASKS,
  EMAIL_TEMPLATE_IDS,
  DURABLE_FUNCTIONS,
  ACTIVITY,
  TASKS_AMENDMENT,
  NDB_TASKS_AMENDMENT,
  CURRENCY,
};
