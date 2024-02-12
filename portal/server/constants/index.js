const DASHBOARD = require('./dashboard');
const DATE = require('./date');
const FACILITY_HAS_BEEN_ISSUED = require('./facility-has-been-issued');
const FACILITY_TYPE = require('./facility-type');
const FACILITY_STAGE = require('./facility-stage');
const FIELD_NAMES = require('./field-names');
const LOGIN_STATUS = require('./login-status');
const PRODUCT = require('./product');
const STATUS = require('./status');
const SUBMISSION_TYPE = require('./submission-type');
const TRANSACTION_STAGE = require('./transaction-stage');
const TRANSACTION_TYPE = require('./transaction-type');
const PORTAL_URL = require('./portalUrl.constant');
const SORT_BY = require('./sort');
const CURRENCY = require('./currency');
const UTILISATION_REPORT_HEADERS = require('./utilisation-report-headers');
const { FILE_UPLOAD } = require('./file-upload');
const { ROLES } = require('./roles');
const { MONTH_NAMES } = require('./month-names');
const ALL_BANKS_ID = require('./all-banks-id');
const HTTP_ERROR_CAUSES = require('./http-error-causes');
const { LANDING_PAGES } = require('./landing-pages');
const { PRIMARY_NAV_KEY } = require('./primary-nav-key');

module.exports = {
  DASHBOARD,
  DATE,
  FACILITY_HAS_BEEN_ISSUED,
  FACILITY_TYPE,
  FACILITY_STAGE,
  FIELD_NAMES,
  PRODUCT,
  STATUS,
  SUBMISSION_TYPE,
  TRANSACTION_STAGE,
  TRANSACTION_TYPE,
  PORTAL_URL,
  SORT_BY,
  CURRENCY,
  UTILISATION_REPORT_HEADERS,
  FILE_UPLOAD,
  ROLES,
  MONTH_NAMES,
  ALL_BANKS_ID,
  LOGIN_STATUS,
  HTTP_ERROR_CAUSES,
  LANDING_PAGES,
  PRIMARY_NAV_KEY,
};
