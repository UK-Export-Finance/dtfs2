const FACILITIES = require('./facilities');
const DEALS = require('./deals');
const { TEAMS, TEAM_IDS } = require('./teams');
const TASKS = require('./tasks');
const TASKS_AMENDMENT = require('./tasks-amendment.constant');
const NDB_TASKS_AMENDMENT = require('./tasks-ndb-amendment.constant');
const EMAIL_TEMPLATE_IDS = require('./email-template-ids');
const ACTIVITY = require('./activity');
const AMENDMENTS = require('./amendments');
const USER = require('./user');
const REGEX = require('./regex');
const { FILESHARES } = require('./fileshares');

module.exports = {
  FACILITIES,
  DEALS,
  TEAMS,
  TEAM_IDS,
  TASKS,
  EMAIL_TEMPLATE_IDS,
  ACTIVITY,
  TASKS_AMENDMENT,
  NDB_TASKS_AMENDMENT,
  AMENDMENTS,
  USER,
  REGEX,
  FILESHARES,
};
