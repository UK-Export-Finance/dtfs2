const { dealFormsCompleted, dealHasIncompleteTransactions } = require('./dealFormsCompleted');
const errorHref = require('./errorHref');
const formatCountriesForGDSComponent = require('./formatCountriesForGDSComponent');
const formattedTimestamp = require('./formattedTimestamp');
const getApiData = require('./getApiData');
const getFlashSuccessMessage = require('./getFlashSuccessMessage');
const generateErrorSummary = require('./generateErrorSummary');
const getUserRoles = require('./getUserRoles');
const isObject = require('./isObject');
const isSuperUser = require('./isSuperUser');
const mapCurrencies = require('./mapCurrencies');
const mapCountries = require('./mapCountries');
const mapIndustryClasses = require('./mapIndustryClasses');
const mapIndustrySectors = require('./mapIndustrySectors');
const { pageSpecificValidationErrors } = require('./pageSpecificValidationErrors');
const postToApi = require('./postToApi');
const requestParams = require('./requestParams');
const sanitizeCurrency = require('./sanitizeCurrency');
const validationErrorHandler = require('./validationErrorHandler');

module.exports = {
  dealFormsCompleted,
  dealHasIncompleteTransactions,
  errorHref,
  formatCountriesForGDSComponent,
  formattedTimestamp,
  getApiData,
  getFlashSuccessMessage,
  generateErrorSummary,
  getUserRoles,
  isObject,
  isSuperUser,
  mapCountries,
  mapCurrencies,
  mapIndustryClasses,
  mapIndustrySectors,
  pageSpecificValidationErrors,
  postToApi,
  requestParams,
  sanitizeCurrency,
  validationErrorHandler,
};
