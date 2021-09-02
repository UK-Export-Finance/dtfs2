const { dealFormsCompleted, dealHasIncompleteTransactions } = require('./dealFormsCompleted');
const getApiData = require('./getApiData');
const requestParams = require('./requestParams');
const getFlashSuccessMessage = require('./getFlashSuccessMessage');
const generateErrorSummary = require('./generateErrorSummary');
const formatCountriesForGDSComponent = require('./formatCountriesForGDSComponent');
const formattedTimestamp = require('./formattedTimestamp');
const errorHref = require('./errorHref');
const postToApi = require('./postToApi');
const mapCurrencies = require('./mapCurrencies');
const mapCountries = require('./mapCountries');
const mapIndustryClasses = require('./mapIndustryClasses');
const mapIndustrySectors = require('./mapIndustrySectors');
const { pageSpecificValidationErrors } = require('./pageSpecificValidationErrors');
const sanitizeCurrency = require('./sanitizeCurrency');
const isObject = require('./isObject');
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
  postToApi,
  mapCountries,
  mapCurrencies,
  mapIndustryClasses,
  mapIndustrySectors,
  pageSpecificValidationErrors,
  sanitizeCurrency,
  isObject,
  validationErrorHandler,
};
