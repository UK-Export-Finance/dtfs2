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

/**
 * Updates the facility master record with new values based on the provided facility, ACBS facility, and deal details.
 *
 * This function performs the following operations:
 * 1. Extracts the issue date from the facility and ACBS facility effective date.
 * 2. Retrieves the guarantee expiry date from the facility's guarantee dates.
 * 3. Constructs and returns the updated facility master record object with the necessary fields.
 *
 * @param {Object} facility - The facility object containing facility details.
 * @param {Object} facility.tfm - The TFM-specific details of the facility.
 * @param {Object} facility.tfm.facilityGuaranteeDates - The guarantee dates of the facility.
 * @param {Object} acbsFacility - The existing ACBS facility object to be updated.
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} deal.dealSnapshot - The snapshot of the deal details.
 * @param {string} deal.dealSnapshot.dealType - The type of the deal (e.g., GEF, BSS_EWCS).
 * @returns {Object} - The updated facility master record, including issue date, guarantee expiry date, next quarter end date, exposure period, capital conversion factor code, facility stage code, forecast percentage, and product type name.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the update process.
 */
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
