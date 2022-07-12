/*
"facilityIdentifier":           UKEF facilityId
"amount":                       feeRecord (GEF)
"effectiveDate":                SEE Deal + deal investor calcuation
"expirationDate":               Facility expiry date
"nextDueDate":                  Facility expiry date (GEF)
"nextAccrueToDate":             Facility expiry date (GEF)
"period":                       TFM Premium schedule, `01` for GEF month count
                                `01`, `02`.. for EWCS/BSS
"currency":                     Facility currency code
"lenderTypeCode":               Set lender to 100, this will trigger automatic 500 record creation
                                thus creating minimum two records.
"incomeClassCode":              ACBS income class code
"spreadToInvestorsIndicator":   True (Added in 11/2021)
*/

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

const constructFeeRecord = (deal, facility, premiumScheduleIndex = 0) => {
  try {
    const effectiveDate = helpers.getIssueDate(facility, getDealSubmissionDate(deal));
    const {
      expirationDate,
      nextDueDate,
      nextAccrueToDate,
    } = helpers.getFeeDates(facility, deal.dealSnapshot.dealType, premiumScheduleIndex);

    return {
      facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
      effectiveDate,
      amount: helpers.getFeeAmount(facility, deal.dealSnapshot.dealType, premiumScheduleIndex),
      expirationDate,
      nextDueDate,
      nextAccrueToDate,
      period: helpers.getFeeRecordPeriod(facility, deal.dealSnapshot.dealType, premiumScheduleIndex),
      currency: facility.facilitySnapshot.currency.id,
      lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
      incomeClassCode: helpers.getIncomeClassCode(deal.dealSnapshot.dealType),
      spreadToInvestorsIndicator: true,
    };
  } catch (e) {
    console.error('Unable to map facility fixed fee record.', { e });
    return e;
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
