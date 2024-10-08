const { isEveryDealFormComplete, isEveryFacilityInDealComplete } = require('./dealFormsCompleted');
const errorHref = require('./errorHref');
const formatCountriesForGDSComponent = require('./formatCountriesForGDSComponent');
const getApiData = require('./getApiData');
const getFlashSuccessMessage = require('./getFlashSuccessMessage');
const generateErrorSummary = require('./generateErrorSummary');
const getUserRoles = require('./getUserRoles');
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
const constructPayload = require('./constructPayload');
const { getBusinessDayOfMonth } = require('./getBusinessDayOfMonth');
const { getNowAsEpoch } = require('./date');
const { convertUserFormDataToRequest } = require('./convertUserFormDataToRequest');

module.exports = {
  isEveryDealFormComplete,
  isEveryFacilityInDealComplete,
  errorHref,
  formatCountriesForGDSComponent,
  getApiData,
  getFlashSuccessMessage,
  generateErrorSummary,
  getUserRoles,
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
  constructPayload,
  getBusinessDayOfMonth,
  getNowAsEpoch,
  convertUserFormDataToRequest,
};
