const { dealFormsCompleted, dealHasIncompleteTransactions } = require('./dealFormsCompleted');
const getApiData = require('./getApiData');
const requestParams = require('./requestParams');
const getFlashSuccessMessage = require('./getFlashSuccessMessage');
const generateErrorSummary = require('./generateErrorSummary');
const formatCountriesForGDSComponent = require('./formatCountriesForGDSComponent');
const formattedTimestamp = require('./formattedTimestamp');
const errorHref = require('./errorHref');
const isObject = require('./isObject');
const isSuperUser = require('./isSuperUser');
const mapCurrencies = require('./mapCurrencies');
const mapCountries = require('./mapCountries');
const mapIndustryClasses = require('./mapIndustryClasses');
const mapIndustrySectors = require('./mapIndustrySectors');
const { pageSpecificValidationErrors } = require('./pageSpecificValidationErrors');
const postToApi = require('./postToApi');
const sanitizeCurrency = require('./sanitizeCurrency');
const validationErrorHandler = require('./validationErrorHandler');

module.exports = {
  dealFormsCompleted,
  dealHasIncompleteTransactions,
  getApiData,
  requestParams,
  getFlashSuccessMessage,
  generateErrorSummary,
  formatCountriesForGDSComponent,
  formattedTimestamp,
  errorHref,
  isObject,
  isSuperUser,
  mapCountries,
  mapCurrencies,
  mapIndustryClasses,
  mapIndustrySectors,
  pageSpecificValidationErrors,
  postToApi,
  sanitizeCurrency,
  validationErrorHandler,
};
