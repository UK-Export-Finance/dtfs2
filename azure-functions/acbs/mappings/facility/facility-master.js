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
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

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
