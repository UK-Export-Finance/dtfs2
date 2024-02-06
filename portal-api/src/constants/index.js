const FACILITIES = require('./facilities');
const DEAL = require('./deal');
const LOGIN_RESULTS = require('./login-results');
const USER = require('./user');
const EMAIL_TEMPLATE_IDS = require('./email-template-ids');
const CURRENCY = require('./currency');
const PAYLOAD = require('./payloads');
const LOGIN_STATUSES = require('./login-statuses');
const { FILE_UPLOAD, FILESHARES } = require('./file-upload');
const SIGN_IN_LINK = require('./sign-in-link');
const HTTP_ERROR_CAUSES = require('./http-error-causes');
const PASSPORT_VALIDATION_RESULTS = require('./passport-validation-results');

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
  SIGN_IN_LINK,
  HTTP_ERROR_CAUSES,
  PASSPORT_VALIDATION_RESULTS
};
