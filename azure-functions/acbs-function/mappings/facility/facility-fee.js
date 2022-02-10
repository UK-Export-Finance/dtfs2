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

const facilityFee = (deal, facility) => {
  const { effectiveDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';
  const {
    expirationDate,
    nextDueDate,
    nextAccrueToDate,
  } = helpers.getFeeDates(facility, deal.dealSnapshot.dealType);

  return {
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    effectiveDate,
    amount: helpers.getFeeAmount(facility, deal.dealSnapshot.dealType),
    expirationDate,
    nextDueDate,
    nextAccrueToDate,
    period: helpers.getFeeRecordPeriod(facility, deal.dealSnapshot.dealType),
    currency: facility.facilitySnapshot.currency.id,
    lenderTypeCode: CONSTANTS.FACILITY.LENDER_TYPE.TYPE1,
    incomeClassCode: helpers.getIncomeClassCode(facility, deal.dealSnapshot.dealType),
    spreadToInvestorsIndicator: true,
  };
};

module.exports = facilityFee;
