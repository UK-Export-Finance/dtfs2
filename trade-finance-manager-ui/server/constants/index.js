const DEAL = require('./deal');
const FACILITY = require('./facility');
const TABLE = require('./table');
const TASKS = require('./tasks');
const { TEAM_IDS, PDC_TEAM_IDS } = require('./team-ids');
const ACTIVITIES = require('./activities');
const AMENDMENTS = require('./amendments');
const DECISIONS = require('./decisions.constant');
const PARTY = require('./party');
const { BANK_HOLIDAY_REGION } = require('./bank-holiday-region');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('./utilisation-report-reconciliation-status');
const SSO = require('./sso');

module.exports = {
  DEAL,
  FACILITY,
  TABLE,
  TASKS,
  TEAM_IDS,
  PDC_TEAM_IDS,
  ACTIVITIES,
  AMENDMENTS,
  DECISIONS,
  PARTY,
  BANK_HOLIDAY_REGION,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  SSO,
};
