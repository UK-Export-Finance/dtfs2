/*
"facilityIdentifier":           UKEF facilityId
"amount":                       ukefExposure
"effectiveDate":                SEE Deal + deal investor calcuation
"expirationDate":               Facility expiry date
"nextDueDate":                  guaranteeCommencementDate + Fee frequency in months
"nextAccrueToDate":             Same as nextDueDate
"period":                       TFM Exposure period in months
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
    period: facility.tfm.exposurePeriodInMonths,
    currency: facility.facilitySnapshot.currency.id,
    lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
    incomeClassCode: helpers.getIncomeClassCode(facility, deal.dealSnapshot.dealType),
    spreadToInvestorsIndicator: true,
  };
};

module.exports = facilityFee;
