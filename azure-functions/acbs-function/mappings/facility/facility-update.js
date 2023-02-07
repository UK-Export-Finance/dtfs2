/*
  "dealIdentifier":                 Deal ACBS ID,
  "facilityIdentifier":             UKEF facilityId,
  "portfolioIdentifier":            Facility portfolio identifier. Default to "E1"
  "dealBorrowerIdentifier":         exporter ACBS ID
                                    Look up the Obligor ACBS Customer record
                                    Use Party URN on the Deal = Alternate Customer Id.
                                    Use ACBS Customer Id (J$MRUI)
                                    Note there may be multiple customers in ACBS with the same Party URN.
                                    Use the first record found,
  "maximumLiability":               ukef Exposure
  "productTypeId":                  Facility Type i.e. 250 for BOND ??? What is LOAN and GEF?
  "capitalConversionFactorCode":    This field is required for GEF. Cash facility has 8, Contingent facility has 9.
  "productTypeName":                Facility Type Name/ description i.e. GEF / BSS so appropriate description can be set
  "currency":                       Facility currency code
  "guaranteeCommencementDate":      see Deal for how to work it out
  "guaranteeExpiryDate":            Guarantee Commencement Date plus exposure period
  "nextQuarterEndDate":             ???
  "delegationType":                 Derive values A,M or N ????
  "intrestOrFeeRate":               Bank Rate, this can be for Bond facility corresponding fee rate
                                    or for Loan/EWCS interest rate
  "facilityStageCode":              Case Stage this can be 06 Commitment and 07 Issued
  "exposurePeriod":                 Credit Period
  "creditRatingCode":               Credit Review Risk Code
  "guaranteePercentage":            Insured %
  "premiumFrequencyCode":           Pre-Issue Est. Payment Frequency QUARTERLY(2)
  "riskCountryCode":                "GBR",
  "riskStatusCode":                 "03",
  "effectiveDate":                  SEE Deal + deal investor calculation
  "foreCastPercentage":             Forecast % Derive from FACILITY:Stage, i.e. Commitment or Issued
  "issueDate":                      At Commitment stage its not required ,
                                    Issued when issued it would be Issue Date for Bond OR Disbursement Date for Loan
  "description":                    FacilityType + Workflow Exposure Period i.e. EWCS 15 Months,
  "agentBankIdentifier":            Bank partyUrn??,
  "obligorPartyIdentifier":         Supplier partyUrn,
  "obligorName":                    Supplier name
  "obligorIndustryClassification":  ACBS Supplier industry classification - must be 4 characters e.g. 0104
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');

const facilityUpdate = (facility, acbsFacility, deal) => {
  const issueDate = helpers.getIssueDate(facility, acbsFacility.effectiveDate);
  const { guaranteeCommencementDate, guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';

  return {
    ...acbsFacility,
    issueDate,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    nextQuarterEndDate: helpers.getNextQuarterDate(issueDate),
    exposurePeriod: helpers.getExposurePeriod(facility, deal.dealSnapshot.dealType),
    description: helpers.getDescription(facility, deal.dealSnapshot.dealType),
    capitalConversionFactorCode: helpers.getCapitalConversionFactorCode(facility),
    facilityStageCode: CONSTANTS.FACILITY.STAGE_CODE.ISSUED,
    foreCastPercentage: CONSTANTS.FACILITY.FORECAST_PERCENTAGE.ISSUED,
    guaranteePercentage: CONSTANTS.FACILITY.GUARANTEE_PERCENTAGE.ISSUED,
    productTypeName: deal.dealSnapshot.dealType,
    obligorName: deal.exporter.companyName.substring(0, 35),
  };
};

module.exports = facilityUpdate;
