/*
"amount"                        Facility Fixed fee period amount
"effectiveDate"                 Facility fixed fee period effective date
"expirationDate"                Facility fixed fee period expiry date
"nextDueDate"                   Facility fixed fee period due date
"nextAccrueToDate"              Facility fixed fee period accrue date
"period"                        Facility fixed fee period (double digit numerical only)
"currency"                      Facility currency code
"lenderTypeCode"                Facility fixed fee lender code (`100` will automatically create `500`)
"incomeClassCode"               Facility fixed fee period ACBS income class code
"spreadToInvestorsIndicator"    Facility fixed fee period investor indicator (default to `true`)
*/

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

/**
 * Constructs and returns the facility fee record(s) for a given deal and facility.
 *
 * This function performs the following operations:
 * 1. Determines the effective date, expiration date, next due date, and next accrue to date for the fee record.
 * 2. Retrieves the currency of the facility, defaulting to a constant if not provided.
 * 3. Constructs the fee record object with the necessary fields.
 * 4. Handles both singular and multiple fee records based on the deal type.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} facility - The facility object containing facility details.
 * @param {number} [premiumScheduleIndex=0] - The index of the premium schedule for multiple fee records.
 * @returns {Object|Array} - The constructed facility fee record(s). Returns an object for singular GEF fee records and an array for multiple EWCS/BSS fee records.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the construction process.
 */
const constructFeeRecord = (deal, facility, premiumScheduleIndex = 0) => {
  try {
    const effectiveDate = helpers.getIssueDate(facility, getDealSubmissionDate(deal));
    const { expirationDate, nextDueDate, nextAccrueToDate } = helpers.getFeeDates(facility, deal.dealSnapshot.dealType, premiumScheduleIndex);
    const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

    return {
      effectiveDate,
      amount: helpers.getFeeAmount(facility, deal.dealSnapshot.dealType, premiumScheduleIndex),
      expirationDate,
      nextDueDate,
      nextAccrueToDate,
      period: helpers.getFeeRecordPeriod(facility, deal.dealSnapshot.dealType, premiumScheduleIndex),
      currency,
      lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
      incomeClassCode: helpers.getIncomeClassCode(facility),
      spreadToInvestorsIndicator: true,
    };
  } catch (error) {
    console.error('Unable to map facility fixed fee record. %o', error);
    return {};
  }
};

/**
 * Generates the facility fee record(s) for a given deal and facility.
 *
 * This function determines whether to generate a singular fee record or multiple fee records
 * based on the deal type. For GEF deals, a single fee record is generated. For EWCS/BSS deals,
 * multiple fee records are generated based on the premium schedule.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} deal.dealSnapshot - The snapshot of the deal details.
 * @param {string} deal.dealSnapshot.dealType - The type of the deal (e.g., GEF, EWCS, BSS).
 * @param {Object} facility - The facility object containing facility details.
 * @param {Object} facility.tfm - The TFM-specific details of the facility.
 * @param {Array} facility.tfm.premiumSchedule - The premium schedule for the facility.
 * @returns {Object|Array} - The generated facility fee record(s). Returns an object for singular GEF fee records and an array for multiple EWCS/BSS fee records.
 */
const facilityFee = (deal, facility) => {
  let feeRecord;
  if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    // Singular GEF fixed fee record - Object
    feeRecord = constructFeeRecord(deal, facility);
  } else {
    // Multiple EWCS/BSS Fee records as per premium schedule - Array
    feeRecord = [];
    if (facility.tfm.premiumSchedule) {
      facility.tfm.premiumSchedule.forEach((premiumSchedule, index) => {
        feeRecord.push(constructFeeRecord(deal, facility, index));
      });
    }
  }
  return feeRecord;
};

module.exports = facilityFee;
