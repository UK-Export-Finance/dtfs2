const FACILITIES = require('./facilities');
const DEAL = require('./deal');
const LOGIN_RESULTS = require('./login-results');
const USER = require('./user');
const EMAIL_TEMPLATE_IDS = require('./email-template-ids');
const CURRENCY = require('./currency');
const PAYLOAD = require('./payloads');
const LOGIN_STATUSES = require('./login-statuses');
const { FILE_UPLOAD, FILESHARES } = require('./file-upload');
const SIGN_IN_LINK_DURATION = require('./sign-in-link-duration');
const { REPORT_FREQUENCY, QUARTERLY_REPORT_START_MONTHS } = require('./report-frequency');

module.exports = {
  FACILITIES,
  DEAL,
  LOGIN_RESULTS,
  LOGIN_STATUSES,
  USER,
  EMAIL_TEMPLATE_IDS,
  CURRENCY,
  PAYLOAD,
  FILE_UPLOAD,
  FILESHARES,
  SIGN_IN_LINK_DURATION,
  REPORT_FREQUENCY,
  QUARTERLY_REPORT_START_MONTHS,
};
