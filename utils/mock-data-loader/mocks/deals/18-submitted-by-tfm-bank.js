const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');

module.exports = {
  "details": {
    "status": "Submitted",
    "bankSupplyContractID": "DTFS2-2723 Mixture - TFM bank",
    "bankSupplyContractName": "DTFS2-2723 Mixture - TFM bank",
    "dateOfLastAction": "1611152642499",
    "submissionType": "Automatic Inclusion Notice",
    "maker": {
      "_id": "5f3ab3f705e6630007dcfb25",
      "username": "maker1@ukexportfinance.gov.uk",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "9",
        "name": "UKEF test bank (Delegated)",
        "emails": [
          "maker@ukexportfinance.gov.uk",
          "checker@ukexportfinance.gov.uk"
        ],
      },
      "lastLogin": "1610710442797",
      "firstname": "Hugo",
      "surname": "Drax",
      "email": "maker1@ukexportfinance.gov.uk",
      "timezone": "Europe/London",
      "user-status": "active"
    },
    "owningBank": {
      "id": "9",
      "name": "UKEF test bank (Delegated)",
      "emails": [
        "maker@ukexportfinance.gov.uk",
        "checker@ukexportfinance.gov.uk"
      ],
    },
    "created": "1610719516272",
    "previousStatus": "Ready for Checker's approval",
    ukefDealId: '0020010552',
  },
  eligibility: {
    submissionType: 'Manual Inclusion Application',
    criteria: ELIGIBILITY_CRITERIA,
    agentAddressLine1: 'ADDR 1',
    agentAddressLine2: 'Addr 2',
    agentAddressLine3: 'Addr 3',
    agentAddressCountry: {
      code: 'GBR',
      name: 'United Kingdom',
    },
    agentName: 'AGENT NAME',
    agentAddressPostcode: 'CF64 5SH',
    agentAddressTown: 'City',
  },
  facilities: [],
    // TODO with mock data: generate facilities
    // so that mocks do not have bondTransactions and loanTransactions
  "bondTransactions": {
    "items": [
      {
        "_id": "1001663",
        "createdDate": "1610719521456",
        "facilityType": "bond",
        "bondIssuer": "",
        "bondType": "Retention bond",
        "facilityStage": "Unissued",
        "ukefGuaranteeInMonths": "12",
        "bondBeneficiary": "",
        "guaranteeFeePayableByBank": "1.8000",
        "lastEdited": "1610719541094",
        "facilityValue": "100000.00",
        "currencySameAsSupplyContractCurrency": "true",
        "riskMarginFee": "2",
        "coveredPercentage": "80",
        "minimumRiskMarginFee": "",
        "ukefExposure": "80,000.00",
        "feeType": "At maturity",
        "dayCountBasis": "360",
        "currency": {
          "text": "GBP - UK Sterling",
          "id": "GBP"
        },
        "ukefFacilityID": "0040004833",
        "bankReferenceNumber": "Test-123"
      }
    ]
  },
  "loanTransactions": {
    "items": [
      {
        "_id": "1001662",
        "ukefGuaranteeInMonths": "12",
        "uniqueIdentificationNumber": "Test-321",
        "facilityValue": "100000.00",
        "currencySameAsSupplyContractCurrency": "true",
        "createdDate": "1610719516261",
        "facilityStage": "Conditional",
        "guaranteeFeePayableByBank": "1.8000",
        "ukefExposure": "80,000.00",
        "lastEdited": "1610719623793",
        "interestMarginFee": "2",
        "coveredPercentage": "80",
        "minimumQuarterlyFee": "",
        "premiumType": "At maturity",
        "dayCountBasis": "360",
        "currency": {
          "text": "GBP - UK Sterling",
          "id": "GBP"
        },
        "ukefFacilityID": "0040004846"
      },
      {
        "_id": "1001666",
        "createdDate": "1610719626281",
        "facilityType": "loan",
        "facilityStage": "Unconditional",
        "requestedCoverStartDate-day": "25",
        "requestedCoverStartDate-month": "1",
        "requestedCoverStartDate-year": "2021",
        "coverEndDate-day": "01",
        "coverEndDate-month": "02",
        "coverEndDate-year": "2021",
        "uniqueIdentificationNumber": "Test-321",
        "guaranteeFeePayableByBank": "1.8000",
        "lastEdited": "1611152634768",
        "facilityValue": "100000.00",
        "currencySameAsSupplyContractCurrency": "true",
        "disbursementAmount": "50000.00",
        "interestMarginFee": "2",
        "coveredPercentage": "80",
        "minimumQuarterlyFee": "",
        "ukefExposure": "80,000.00",
        "premiumType": "At maturity",
        "dayCountBasis": "365",
        "requestedCoverStartDate": "1611584634768",
        "currency": {
          "text": "GBP - UK Sterling",
          "id": "GBP"
        },
        "ukefFacilityID": "0040004839"
      }
    ]
  },
  editedBy: [],
  submissionDetails: {
    "status": "Incomplete",
    "supplier-type": "Exporter",
    "supplier-companies-house-registration-number": "",
    "supplier-name": "Test",
    "supplier-address-country": {
      "name": "Armenia",
      "code": "ARM"
    },
    "supplier-address-line-1": "Test",
    "supplier-address-line-2": "",
    "supplier-address-line-3": "",
    "supplier-address-town": "Test",
    "supplier-address-postcode": "",
    "supplier-correspondence-address-is-different": "false",
    "supplier-correspondence-address-country": {
      "name": null,
      "code": null
    },
    "supplier-correspondence-address-line-1": "",
    "supplier-correspondence-address-line-2": "",
    "supplier-correspondence-address-line-3": "",
    "supplier-correspondence-address-town": "",
    "supplier-correspondence-address-postcode": "",
    "industry-sector": {
      "code": "1012",
      "name": "Professional, scientific and technical activities"
    },
    "industry-class": {
      "code": "74203",
      "name": "Film processing"
    },
    "sme-type": "Small",
    "supply-contract-description": "Test",
    "legallyDistinct": "false",
    "indemnifier-companies-house-registration-number": "",
    "indemnifier-name": "",
    "indemnifier-address-country": {
      "name": null,
      "code": null
    },
    "indemnifier-address-line-1": "",
    "indemnifier-address-line-2": "",
    "indemnifier-address-line-3": "",
    "indemnifier-address-town": "",
    "indemnifier-address-postcode": "",
    "indemnifier-correspondence-address-country": {
      "name": null,
      "code": null
    },
    "indemnifier-correspondence-address-line-1": "",
    "indemnifier-correspondence-address-line-2": "",
    "indemnifier-correspondence-address-line-3": "",
    "indemnifier-correspondence-address-town": "",
    "indemnifier-correspondence-address-postcode": "",
    "indemnifierCorrespondenceAddressDifferent": "",
    "buyer-name": "Test",
    "buyer-address-country": {
      "name": "Azerbaijan",
      "code": "AZE"
    },
    "buyer-address-line-1": "Test",
    "buyer-address-line-2": "",
    "buyer-address-line-3": "",
    "buyer-address-town": "Test",
    "buyer-address-postcode": "",
    "destinationOfGoodsAndServices": {
      "name": "Austria",
      "code": "AUT"
    },
    "supplyContractValue": "7000000.00",
    "supplyContractCurrency": {
      "text": "GBP - UK Sterling",
      "id": "GBP"
    },
    "supplyContractConversionRateToGBP": "",
    "supplyContractConversionDate-day": "",
    "supplyContractConversionDate-month": "",
    "supplyContractConversionDate-year": ""
  },
};
