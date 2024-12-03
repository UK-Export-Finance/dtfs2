const isIssued = require('./is-issued');
const getDelegationType = require('./get-delegation-type');
const getProductTypeId = require('./get-product-type-id');
const getProductTypeGroup = require('./get-product-type-group');
const getCapitalConversionFactorCode = require('./get-capital-conversion-factor-code');
const getInterestOrFeeRate = require('./get-interest-or-fee-rate');
const getFacilityStageCode = require('./get-facility-stage-code');
const getExposurePeriod = require('./get-exposure-period');
const getPremiumFrequencyCode = require('./get-premium-frequency-code');
const getForecastPercentage = require('./get-forecast-percentage');
const getDescription = require('./get-description');
const getNextQuarterDate = require('./get-next-quarter-date');
const getIssueDate = require('./get-issue-date');
const getGuarantorParty = require('./get-guarantor-party');
const getFacilityValue = require('./get-facility-value');
const getMaximumLiability = require('./get-maximum-liability');
const getLoanMaximumLiability = require('./get-loan-maximum-liability');
const mapFeeFrequency = require('./map-fee-frequency');
const mapFeeType = require('./map-fee-type');
const getInsuredPercentage = require('./get-insured-percentage');
const getBaseCurrency = require('./get-base-currency');
const getCoverStartDate = require('./get-cover-start-date');
const hasFacilityBeenIssued = require('./get-facility-issue-status');
const getCurrencyExchangeRate = require('./get-facility-currency-exchange-rate');
const getNextDueDate = require('./get-next-due-date');
const getYearBasis = require('./get-year-basis');
const getFeeFrequency = require('./get-fee-frequency');
const getFeeType = require('./get-fee-type');
const getFeeFrequencyMonths = require('./get-fee-frequency-months');
const getIncomeClassCode = require('./get-income-class-code');
const getFeeRecordPeriod = require('./get-fee-record-period');
const getFeeDates = require('./get-fee-dates');
const getFeeAmount = require('./get-fee-amount');
const getCreditRatingCode = require('./get-credit-rating-code');
const getLoanAmountDifference = require('./get-loan-amount-difference');

module.exports = {
  isIssued,
  getDelegationType,
  getProductTypeId,
  getProductTypeGroup,
  getCapitalConversionFactorCode,
  getInterestOrFeeRate,
  getFacilityStageCode,
  getExposurePeriod,
  getPremiumFrequencyCode,
  getForecastPercentage,
  getDescription,
  getNextQuarterDate,
  getIssueDate,
  getGuarantorParty,
  getFacilityValue,
  getMaximumLiability,
  getLoanMaximumLiability,
  mapFeeFrequency,
  mapFeeType,
  getInsuredPercentage,
  getBaseCurrency,
  getCoverStartDate,
  hasFacilityBeenIssued,
  getCurrencyExchangeRate,
  getNextDueDate,
  getYearBasis,
  getFeeFrequency,
  getFeeType,
  getFeeFrequencyMonths,
  getIncomeClassCode,
  getFeeRecordPeriod,
  getFeeDates,
  getFeeAmount,
  getCreditRatingCode,
  getLoanAmountDifference,
};
