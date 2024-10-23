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
const { formatDate } = require('../../helpers/date');

/**
 * Constructs the amended facility master record for a given deal and amendments.
 *
 * This function performs the following operations:
 * 1. Constructs the base facility master record using the provided facility master record (fmr) and deal details.
 * 2. Checks for amendments and updates the facility master record accordingly.
 * 3. Updates the maximum liability if the amendment includes an amount.
 * 4. Updates the guarantee expiry date and exposure period if the amendment includes a cover end date.
 *
 * @param {Object} fmr - The facility master record to be amended.
 * @param {Object} amendments - The amendments to be applied to the facility master record.
 * @param {Object} amendments.amendment - The specific amendment details.
 * @param {number} [amendments.amendment.amount] - The amended amount for the facility.
 * @param {string} [amendments.amendment.coverEndDate] - The amended cover end date for the facility.
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} deal.dealSnapshot - The snapshot of the deal details.
 * @param {string} deal.dealSnapshot.dealType - The type of the deal (e.g., GEF, BSS_EWCS).
 * @returns {Object} - The amended facility master record, including updated maximum liability and guarantee expiry date if applicable.
 * @throws {Error} - Logs the error and returns the original facility master record if any error occurs during the amendment process.
 */
const facilityMasterAmend = (fmr, amendments, deal) => {
  try {
    // Construct base record
    let record = {
      ...fmr,
      productTypeName: deal.dealSnapshot.dealType,
    };
    const { amendment } = amendments;
    // Construct amendment record
    if (amendment) {
      const { amount, coverEndDate } = amendment;

      // UKEF Exposure
      if (amount) {
        record = {
          ...record,
          maximumLiability: helpers.getMaximumLiability(amendments),
        };
      }

      // Cover end date
      if (coverEndDate) {
        record = {
          ...record,
          guaranteeExpiryDate: formatDate(coverEndDate),
          exposurePeriod: helpers.getExposurePeriod(amendments, deal.dealSnapshot.dealType, fmr),
        };
      }
    }

    // Return amended FMR
    return record;
  } catch (error) {
    console.error('Unable to map facility master amendment record %o', error);
    return {};
  }
};

module.exports = facilityMasterAmend;
