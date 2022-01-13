/*
  "dealIdentifier":                 Deal ACBS ID,
  "facilityIdentifier":             UKEF facilityId,
  "portfolioIdentifier":            Facility portfolio idenfifier. Default to "E1"
  "dealBorrowerIdentifier":         exporter ACBS ID
                                    Look up the Obligors ACBS Customer record
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
  "effectiveDate":                  SEE Deal + deal investor calcuation
  "foreCastPercentage":             Forecast % Derive from FACILITY:Stage, i.e. Commitment or Issued
  "issueDate":                      At Commitment stage its not required ,
                                    Issued when issued it would be Issue Date for Bond OR Disbursement Date for Loan
  "description":                    FacilityType + Workflow Exposure Period i.e. EWCS 15 Months,
  "agentBankIdentifier":            Bank partyUrn??,
  "obligorPartyIdentifier":         Supplier partyUrn,
  "obligorName":                    Supplier name
  "obligorIndustryClassification":  ACBS Supplier industry classification - must be 4 characters e.g. 0104
  "probabilityOfDefault":           Optional field used for GEF
  */

const helpers = require('./helpers');
const CONSTANTS = require('../../constants');
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

const facilityMaster = (deal, facility, acbsData, acbsReference) => {
  const { guaranteeCommencementDate, guaranteeExpiryDate, effectiveDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : '';

  const issueDate = helpers.getIssueDate(facility, getDealSubmissionDate(deal));
  const facilityStageCode = helpers.getFacilityStageCode(facility.facilitySnapshot, deal.dealSnapshot.dealType);

  return {
    _id: deal._id,
    dealIdentifier: acbsData.deal.dealIdentifier.padStart(10, 0),
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    dealBorrowerIdentifier: acbsData.parties.exporter.partyIdentifier,
    maximumLiability: helpers.getMaximumLiability(facility.facilitySnapshot),
    productTypeId: helpers.getProductTypeId(facility, deal.dealSnapshot.dealType),
    capitalConversionFactorCode:
      helpers.getCapitalConversionFactorCode(facility),
    productTypeName: deal.dealSnapshot.dealType,
    currency: facility.facilitySnapshot.currency.id,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    nextQuarterEndDate: helpers.getNextQuarterDate(issueDate),
    delegationType: helpers.getDelegationType(deal.dealSnapshot.submissionType),
    intrestOrFeeRate: helpers.getInterestOrFeeRate(facility.facilitySnapshot, deal.dealSnapshot.dealType),
    facilityStageCode,
    exposurePeriod: String(helpers.getExposurePeriod(facility, deal.dealSnapshot.dealType)),
    creditRatingCode: CONSTANTS.FACILITY.CREDIT_RATING.CODE14,
    guaranteePercentage: helpers.getInsuredPercentage(facilityStageCode),
    premiumFrequencyCode: helpers.getPremiumFrequencyCode(facility.facilitySnapshot),
    riskCountryCode: CONSTANTS.FACILITY.RISK.COUNTRY.UNITED_KINGDOM,
    riskStatusCode: CONSTANTS.FACILITY.RISK.STATUS.TYPE03,
    effectiveDate,
    foreCastPercentage: helpers.getForecastPercentage(facility.facilitySnapshot, deal.dealSnapshot.dealType),
    issueDate,
    description: helpers.getDescription(facility, deal.dealSnapshot.dealType),
    agentBankIdentifier: CONSTANTS.FACILITY.BANK_IDENTIFIER.DEFAULT,
    obligorPartyIdentifier: acbsData.parties.exporter.partyIdentifier,
    obligorName: deal.dealSnapshot.exporter.companyName.substring(0, 35),
    obligorIndustryClassification: acbsReference.supplierAcbsIndustryCode,
    probabilityOfDefault: deal.tfm.probabilityOfDefault,
  };
};

module.exports = facilityMaster;
