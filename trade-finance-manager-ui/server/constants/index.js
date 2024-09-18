const DEAL = require('./deal');
const TABLE = require('./table');
const TASKS = require('./tasks');
const ACTIVITIES = require('./activities');
const AMENDMENTS = require('./amendments');
const DECISIONS = require('./decisions.constant');
const PARTY = require('./party');
const { BANK_HOLIDAY_REGION } = require('./bank-holiday-region');
const SSO = require('./sso');
const { PRIMARY_NAVIGATION_KEYS } = require('./primary-navigation-keys');
const { REGEX } = require('./regex');
const { UTILISATION_REPORT_DISPLAY_FREQUENCY } = require('./utilisation-report-display-frequency');
const { BANK_REPORTS_FOR_PERIOD_TABLE_HEADER_PREFIX } = require('./bank-reports-for-period-table-header-prefix');
const { DATE_FORMAT } = require('./date-format');

module.exports = {
  DEAL,
  TABLE,
  TASKS,
  ACTIVITIES,
  AMENDMENTS,
  DECISIONS,
  PARTY,
  BANK_HOLIDAY_REGION,
  SSO,
  PRIMARY_NAVIGATION_KEYS,
  REGEX,
  UTILISATION_REPORT_DISPLAY_FREQUENCY,
  BANK_REPORTS_FOR_PERIOD_TABLE_HEADER_PREFIX,
  DATE_FORMAT,
};
