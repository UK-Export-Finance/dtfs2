const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');

module.exports = {
  bankSupplyContractName: 'UKEF plc',
  details: {
    bank: 'UKEF test bank',
    bankSupplyContractID: 'MIA-Msstar-BSS-DGR-3',
    bankSupplyContractName: 'MIA deal - Manual Inclusion Application',
    ukefDealId: '20010739',
    status: 'Submitted',
    previousStatus: 'Submitted',
    checker: {
      username: 'CHECKER',
      firstname: 'Emilio',
      surname: 'Largo',
    },
    submissionType: 'Manual Inclusion Application',
    owningBank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  eligibility: {
    submissionType: 'Manual Inclusion Application',
    criteria: ELIGIBILITY_CRITERIA,
  },
  facilities: [
    {
      "bondIssuer": "Issuer",
      "bondType": "Advance payment guarantee",
      "facilityStage": "Unissued",
      "ukefGuaranteeInMonths": "10",
      "bondBeneficiary": "",
      "guaranteeFeePayableByBank": "9.0000",
      "facilityValue": "12345.00",
      "currencySameAsSupplyContractCurrency": "true",
      "riskMarginFee": "10",
      "coveredPercentage": "20",
      "minimumRiskMarginFee": "30",
      "ukefExposure": "2,469.00",
      "feeType": "At maturity",
      "dayCountBasis": "365",
      "currency": {
        "text": "GBP - UK Sterling",
        "id": "GBP"
      },
      "_id": 12345678,
      "coverEndDate-day": "24",
      "coverEndDate-month": "09",
      "coverEndDate-year": "2020"
    },
    {
      "_id": "23456789",
      "createdDate": 1610369832226.0,
      "facilityStage": "Conditional",
      "ukefGuaranteeInMonths": "12",
      "bankReferenceNumber": "5678",
      "guaranteeFeePayableByBank": "27.0000",
      "lastEdited": 1610369832226.0,
      "facilityValue": "1234.00",
      "currencySameAsSupplyContractCurrency": "true",
      "interestMarginFee": "30",
      "coveredPercentage": "20",
      "minimumQuarterlyFee": "",
      "ukefExposure": "246.80",
      "premiumType": "At maturity",
      "dayCountBasis": "365",
      "issuedDate-day": "25",
      "issuedDate-month": "08",
      "issuedDate-year": "2020",
      "coverEndDate-day": "24",
      "coverEndDate-month": "09",
      "coverEndDate-year": "2020",
      "disbursementAmount": "1,234.00",
      "issueFacilityDetailsStarted": true,
      "bankReferenceNumberRequiredForIssuance": true,
      "requestedCoverStartDate": 1610369832226.0,
      "issuedDate": 1610369832226.0,
      "issueFacilityDetailsProvided": true,
      "status": "Acknowledged",
      "ukefFacilityID": "65432"
    }
  ],
  submissionDetails: {
    "status": "Incomplete",
    "indemnifier-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "indemnifier-address-line-1": "",
    "indemnifier-address-line-2": "",
    "indemnifier-address-line-3": "",
    "indemnifier-address-postcode": "",
    "indemnifier-address-town": "",
    "indemnifier-companies-house-registration-number": "",
    "indemnifier-correspondence-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "indemnifier-correspondence-address-line-1": "",
    "indemnifier-correspondence-address-line-2": "",
    "indemnifier-correspondence-address-line-3": "",
    "indemnifier-correspondence-address-postcode": "",
    "indemnifier-correspondence-address-town": "",
    "indemnifier-name": "",
    "industry-class": {
      "code": "56101",
      "name": "Licensed restaurants"
    },
    "industry-sector": {
      "code": "1008",
      "name": "Accommodation and food service activities"
    },
    "legallyDistinct": "false",
    "sme-type": "Micro",
    "supplier-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "supplier-address-line-1": "test",
    "supplier-address-line-2": "test",
    "supplier-address-line-3": "test",
    "supplier-address-postcode": "test",
    "supplier-address-town": "test",
    "supplier-companies-house-registration-number": "",
    "supplier-correspondence-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "supplier-correspondence-address-is-different": "false",
    "supplier-correspondence-address-line-1": "",
    "supplier-correspondence-address-line-2": "",
    "supplier-correspondence-address-line-3": "",
    "supplier-correspondence-address-postcode": "",
    "supplier-correspondence-address-town": "",
    "supplier-name": "test",
    "supplier-type": "Exporter",
    "supply-contract-description": "test",
    "buyer-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "buyer-address-line-1": "test",
    "buyer-address-line-2": "test",
    "buyer-address-line-3": "test",
    "buyer-address-postcode": "test",
    "buyer-address-town": "test",
    "buyer-name": "test",
    "destinationOfGoodsAndServices": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "supplyContractConversionDate-day": "",
    "supplyContractConversionDate-month": "",
    "supplyContractConversionDate-year": "",
    "supplyContractConversionRateToGBP": "",
    "supplyContractCurrency": {
      "id": "GBP",
      "text": "GBP - UK Sterling"
    },
    "supplyContractValue": "1234.00"
  },
}
