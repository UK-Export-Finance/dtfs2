/*
  "dealIdentifier"                 Deal ACBS ID,
  "facilityIdentifier"             Facility ACBS ID,
  "dealBorrowerIdentifier"         Exporter ACBS ID
  "maximumLiability"               UKEF Exposure
  "productTypeId"                  Facility Type i.e. 250 for BOND
  "capitalConversionFactorCode"    This field is required for GEF. Cash facility has 8, Contingent facility has 9.
  "productTypeName"                Facility Type Name/ description i.e. GEF / BSS so appropriate description can be set
  "currency"                       Facility currency code
  "guaranteeExpiryDate"            Guarantee Commencement Date plus exposure period
  "nextQuarterEndDate"             Next quarter end date
  "delegationType"                 Derive values A,M or N
  "interestOrFeeRate"              Bank Rate, this can be for Bond facility corresponding fee rate or for Loan/EWCS interest rate
  "facilityStageCode"              Case Stage this can be 06 Commitment and 07 Issued
  "exposurePeriod"                 Credit Period
  "creditRatingCode"               Credit Review Risk Code
  "premiumFrequencyCode"           Pre-Issue Est. Payment Frequency QUARTERLY(2)
  "riskCountryCode"                GBR
  "riskStatusCode"                 03
  "effectiveDate"                  SEE Deal + deal investor calculation
  "forecastPercentage"             Forecast % Derive from FACILITY:Stage, i.e. Commitment or Issued
  "issueDate"                      At Commitment stage its not required, issued when issued it would be Issue Date for Bond OR Disbursement Date for Loan
  "agentBankIdentifier"            Bank partyUrn
  "obligorPartyIdentifier"         Supplier partyUrn
  "obligorIndustryClassification"  ACBS Supplier industry classification - must be 4 characters e.g. 0104
  "probabilityOfDefault"           Optional field used for GEF
*/

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

const facilityUpdate = (facility, acbsFacility, deal) => {
  try {
    const issueDate = helpers.getIssueDate(facility, acbsFacility.effectiveDate);
    const { guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates;

    return {
      ...acbsFacility,
      issueDate,
      guaranteeExpiryDate,
      nextQuarterEndDate: helpers.getNextQuarterDate(issueDate),
      exposurePeriod: helpers.getExposurePeriod(facility, deal.dealSnapshot.dealType),
      capitalConversionFactorCode: helpers.getCapitalConversionFactorCode(facility),
      facilityStageCode: CONSTANTS.FACILITY.STAGE_CODE.ISSUED,
      forecastPercentage: CONSTANTS.FACILITY.FORECAST_PERCENTAGE.ISSUED,
      productTypeName: deal.dealSnapshot.dealType,
    };
  } catch (error) {
    console.error('Unable to map facility issue master record. %o', error);
    return {};
  }
};

module.exports = facilityUpdate;
