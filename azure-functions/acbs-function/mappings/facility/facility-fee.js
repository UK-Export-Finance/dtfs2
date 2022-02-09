/*
"facilityIdentifier":           UKEF facilityId
"amount":                       ukefExposure
"effectiveDate":                SEE Deal + deal investor calcuation
"expirationDate":               Facility expiry date
"nextDueDate":                  guaranteeCommencementDate + Fee frequency in months
"nextAccrueToDate":             Same as nextDueDate
"period":                       TFM Premium schedule, `01` for GEF month count
                                `01`, `02`.. for EWCS/BSS
"currency":                     Facility currency code
"lenderTypeCode":               Set lender to 100, this will trigger automatic 500 record creation
"incomeClassCode":              ACBS income class code
"spreadToInvestorsIndicator":   True (Added in 11/2021)
*/

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

const facilityFee = (deal, facility) => {
  const { guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';

  return {
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    amount: facility.tfm.ukefExposure,
    effectiveDate,
    expirationDate: guaranteeExpiryDate,
    nextDueDate: helpers.getNextDueDate(facility, deal.dealSnapshot.dealType),
    nextAccrueToDate: helpers.getNextDueDate(facility, deal.dealSnapshot.dealType),
    period: helpers.getFeeRecordPeriod(facility, deal.dealSnapshot.dealType),
    currency: facility.facilitySnapshot.currency.id,
    lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
    incomeClassCode: helpers.getIncomeClassCode(facility, deal.dealSnapshot.dealType),
    spreadToInvestorsIndicator: true,
  };
};

module.exports = facilityFee;
