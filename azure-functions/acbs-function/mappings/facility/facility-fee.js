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
