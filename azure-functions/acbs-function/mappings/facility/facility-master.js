/*
  "dealIdentifier"                 Deal ACBS ID,
  "facilityIdentifier"             UKEF facilityId,
  "dealBorrowerIdentifier"         exporter ACBS ID
  "maximumLiability"               ukef Exposure
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
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

/**
 * Constructs the facility master record for a given deal and facility.
 *
 * This function performs the following operations:
 * 1. Extracts the guarantee expiry date and effective date from the facility's guarantee dates.
 * 2. Retrieves the issue date based on the facility and deal submission date.
 * 3. Determines the facility stage code based on the facility snapshot and deal type.
 * 4. Retrieves the currency of the facility, defaulting to a constant if not provided.
 * 5. Constructs and returns the facility master record object with the necessary fields.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} deal._id - The unique identifier of the deal.
 * @param {Object} deal.dealSnapshot - The snapshot of the deal details.
 * @param {string} deal.dealSnapshot.dealType - The type of the deal (e.g., GEF, BSS_EWCS).
 * @param {string} deal.dealSnapshot.submissionType - The submission type of the deal.
 * @param {Object} facility - The facility object containing facility details.
 * @param {Object} facility.tfm - The TFM-specific details of the facility.
 * @param {Object} facility.tfm.facilityGuaranteeDates - The guarantee dates of the facility.
 * @param {Object} facility.facilitySnapshot - The snapshot of the facility details.
 * @param {string} facility.facilitySnapshot.ukefFacilityId - The UKEF facility ID.
 * @param {Object} facility.facilitySnapshot.currency - The currency details of the facility.
 * @param {Object} acbsData - The ACBS data containing party identifiers and other details.
 * @param {Object} acbsData.deal - The ACBS deal details.
 * @param {string} acbsData.deal.dealIdentifier - The ACBS deal identifier.
 * @param {Object} acbsData.parties - The parties involved in the deal.
 * @param {Object} acbsData.parties.exporter - The exporter party details.
 * @param {string} acbsData.parties.exporter.partyIdentifier - The party identifier of the exporter.
 * @param {Object} acbsReference - The ACBS reference data.
 * @returns {Object} - The constructed facility master record, including deal identifier, facility identifier, borrower identifier, maximum liability, product type ID, capital conversion factor code, product type name, currency, guarantee expiry date, next quarter end date, delegation type, interest or fee rate, facility stage code, exposure period, credit rating code, premium frequency code, risk country code, risk status code, effective date, forecast percentage, and issue date.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the construction process.
 */
const facilityMaster = (deal, facility, acbsData, acbsReference) => {
  try {
    const { guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates;
    const issueDate = helpers.getIssueDate(facility, getDealSubmissionDate(deal));
    const facilityStageCode = helpers.getFacilityStageCode(facility.facilitySnapshot, deal.dealSnapshot.dealType);
    const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

    return {
      _id: deal._id,
      dealIdentifier: acbsData.deal.dealIdentifier.padStart(10, 0),
      facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
      dealBorrowerIdentifier: acbsData.parties.exporter.partyIdentifier,
      maximumLiability: helpers.getMaximumLiability(facility),
      productTypeId: helpers.getProductTypeId(facility, true),
      capitalConversionFactorCode: helpers.getCapitalConversionFactorCode(facility),
      productTypeName: deal.dealSnapshot.dealType,
      currency,
      guaranteeExpiryDate,
      nextQuarterEndDate: helpers.getNextQuarterDate(issueDate),
      delegationType: helpers.getDelegationType(deal.dealSnapshot.submissionType),
      interestOrFeeRate: helpers.getInterestOrFeeRate(facility),
      facilityStageCode,
      exposurePeriod: helpers.getExposurePeriod(facility, deal.dealSnapshot.dealType),
      creditRatingCode: helpers.getCreditRatingCode(deal),
      premiumFrequencyCode: helpers.getPremiumFrequencyCode(facility.facilitySnapshot),
      riskCountryCode: CONSTANTS.FACILITY.RISK.COUNTRY.UNITED_KINGDOM,
      riskStatusCode: CONSTANTS.FACILITY.RISK.STATUS.TYPE03,
      effectiveDate,
      forecastPercentage: helpers.getForecastPercentage(facility.facilitySnapshot, deal.dealSnapshot.dealType),
      issueDate,
      agentBankIdentifier: CONSTANTS.FACILITY.BANK_IDENTIFIER.DEFAULT,
      obligorPartyIdentifier: acbsData.parties.exporter.partyIdentifier,
      obligorIndustryClassification: acbsReference.supplierAcbsIndustryCode,
      probabilityOfDefault: deal.tfm.probabilityOfDefault,
    };
  } catch (error) {
    console.error('Unable to map facility master record. %o', error);
    return {};
  }
};

module.exports = facilityMaster;
