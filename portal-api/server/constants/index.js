const FACILITIES = require('./facilities');
const BANKS = require('./banks');
const DEAL = require('./deal');
const LOGIN_RESULTS = require('./login-results');
const USER = require('./user');
const EMAIL_TEMPLATE_IDS = require('./email-template-ids');
const { FILE_UPLOAD, FILESHARES } = require('./file-upload');
const SIGN_IN_LINK = require('./sign-in-link');
const HTTP_ERROR_CAUSES = require('./http-error-causes');
const PASSPORT_VALIDATION_RESULTS = require('./passport-validation-results');
const DATE_FORMATS = require('./date-formats');
const NUMBER = require('./number');

module.exports = {
  FACILITIES,
  DEAL,
  LOGIN_RESULTS,
  USER,
  EMAIL_TEMPLATE_IDS,
  FILE_UPLOAD,
  FILESHARES,
  SIGN_IN_LINK,
  HTTP_ERROR_CAUSES,
  PASSPORT_VALIDATION_RESULTS,
  DATE_FORMATS,
  NUMBER,
  BANKS,
  ALL: 'all',
};
