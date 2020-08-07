const moment = require('moment');

const deal = {
  "details" : {
    "status" : "Ready for Checker's approval",
    "bankSupplyContractID" : "mock id",
    "bankSupplyContractName" : "mock name",
    "created": moment().utc().valueOf(),
    "dateOfLastAction" : "1596805840467",
    "previousWorkflowStatus": "confirmation_acknowledged",
    "submissionType" : "Automatic Inclusion Notice",
    submissionDate: moment().utc().valueOf(),
    "previousStatus": "Acknowledged by UKEF",
    owningBank: {
      id: '956',
      name: 'Barclays Bank',
    },
  },
  "eligibility" : {
    "status" : "Completed",
      "criteria" : [
        {
          "id": 11,
          "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.",
          "answer": true
        },
        {
          "id": 12,
          "description": "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.",
          "answer": true
        },
        {
          "id": 13,
          "description": "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).",
          "answer": true
        },
        {
          "id": 14,
          "description": "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.",
          "answer": true
        },
        {
          "id": 15,
          "description": "The Requested Cover Start Date is no more than three months from the date of submission.",
          "answer": true
        },
        {
          "id": 16,
          "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.",
          "answer": true
        },
        {
          "id": 17,
          "description": "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.",
          "answer": true
        },
        {
          "id": 18,
          "description": "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.",
          "answer": true
        }
      ],
        "agentAddress1" : "",
          "agentAddress2" : "",
            "agentAddress3" : "",
              "agentCountry" : "",
                "agentName" : "",
                  "agentPostcode" : "",
                    "agentTown" : "",
                      "validationErrors" : {
      "count" : 0,
        "errorList" : {
        "11" : { },
        "12" : { },
        "13" : { },
        "14" : { },
        "15" : { },
        "16" : { },
        "17" : { },
        "18" : { },
        "agent-address-line-1" : { },
        "agent-country" : { },
        "agent-name" : { },
        "agent-postcode" : { },
        "agent-town" : { }
      }
    }
  },
  "submissionDetails" : {
    "status" : "Incomplete",
      "indemnifier-address-country" : {
      "code" : "GBR",
        "name" : "United Kingdom"
    },
    "indemnifier-address-line-1" : "",
      "indemnifier-address-line-2" : "",
        "indemnifier-address-line-3" : "",
          "indemnifier-address-postcode" : "",
            "indemnifier-address-town" : "",
              "indemnifier-companies-house-registration-number" : "",
                "indemnifier-correspondence-address-country" : {
      "code" : "GBR",
        "name" : "United Kingdom"
    },
    "indemnifier-correspondence-address-line-1" : "",
      "indemnifier-correspondence-address-line-2" : "",
        "indemnifier-correspondence-address-line-3" : "",
          "indemnifier-correspondence-address-postcode" : "",
            "indemnifier-correspondence-address-town" : "",
              "indemnifier-name" : "",
                "industry-class" : "84300",
                  "industry-sector" : "1014",
                    "legallyDistinct" : "false",
                      "sme-type" : "Micro",
                        "supplier-address-country" : {
      "code" : "GBR",
        "name" : "United Kingdom"
    },
    "supplier-address-line-1" : "adsf",
      "supplier-address-line-2" : "asdf",
        "supplier-address-line-3" : "asdf",
          "supplier-address-postcode" : "asdf",
            "supplier-address-town" : "asdf",
              "supplier-companies-house-registration-number" : "",
                "supplier-correspondence-address-country" : {
      "code" : "GBR",
        "name" : "United Kingdom"
    },
    "supplier-correspondence-address-is-different" : "false",
      "supplier-correspondence-address-line-1" : "",
        "supplier-correspondence-address-line-2" : "",
          "supplier-correspondence-address-line-3" : "",
            "supplier-correspondence-address-postcode" : "",
              "supplier-correspondence-address-town" : "",
                "supplier-name" : "asdfa",
                  "supplier-type" : "Exporter",
                    "supply-contract-description" : "asdfafd",
                      "buyer-address-country" : {
      "code" : "GBR",
        "name" : "United Kingdom"
    },
    "buyer-address-line-1" : "Ooi",
      "buyer-address-line-2" : "o",
        "buyer-address-line-3" : "oioi",
          "buyer-address-postcode" : "iii",
            "buyer-address-town" : "i",
              "buyer-name" : "asdfasdf",
                "destinationOfGoodsAndServices" : {
      "code" : "GBR",
        "name" : "United Kingdom"
    },
    "supplyContractConversionDate-day" : "",
      "supplyContractConversionDate-month" : "",
        "supplyContractConversionDate-year" : "",
          "supplyContractConversionRateToGBP" : "",
            "supplyContractCurrency" : {
      "id" : "GBP",
        "text" : "GBP - UK Sterling"
    },
    "supplyContractValue" : "12312323.00",
      "hasBeenPreviewed" : true
  },
  "bondTransactions" : {
    "items" : [
      {
        "_id": "1000209",
        "bondIssuer": "",
        "bondType": "Bid bond",
        "bondStage": "Unissued",
        "ukefGuaranteeInMonths": "12",
        "bondBeneficiary": "",
        "guaranteeFeePayableByBank": "18.0000",
        "facilityValue": "21313.00",
        "currencySameAsSupplyContractCurrency": "true",
        "riskMarginFee": "20",
        "coveredPercentage": "30",
        "minimumRiskMarginFee": "",
        "ukefExposure": "6,393.90",
        "feeType": "At maturity",
        "dayCountBasis": "365",
        "currency": {
          "text": "GBP - UK Sterling",
          "id": "GBP"
        },
        issuedDate: moment().add(1, 'day').utc().valueOf(),
        "coverEndDate-day": moment().add(1, 'month').format('DD'),
        "coverEndDate-month": moment().add(1, 'month').format('MM'),
        "coverEndDate-year": moment().add(1, 'month').format('YYYY'),
        "uniqueIdentificationNumber": "1234",
        "uniqueIdentificationNumberRequiredForIssuance": true,
        "issueFacilityDetailsProvided": true,
        "status": "Ready for check"
      }
    ]
  },
  "loanTransactions" : {
    "items" : [
      {
        "_id" : "1000210",
        "facilityStage" : "Conditional",
        "ukefGuaranteeInMonths" : "12",
        "guaranteeFeePayableByBank" : "10.8000",
        "facilityValue" : "123123.00",
        "currencySameAsSupplyContractCurrency" : "true",
        "interestMarginFee" : "12",
        "coveredPercentage" : "20",
        "minimumQuarterlyFee" : "20",
        "ukefExposure" : "24,624.60",
        "premiumFrequency" : "Monthly",
        "premiumType" : "In arrear",
        "dayCountBasis" : "360",
        "viewedPreviewPage" : true,
        "currency" : {
            "text" : "GBP - UK Sterling",
            "id" : "GBP"
        },
        issuedDate: moment().add(1, 'day').utc().valueOf(),
        "coverEndDate-day": moment().add(1, 'month').format('DD'),
        "coverEndDate-month": moment().add(1, 'month').format('MM'),
        "coverEndDate-year": moment().add(1, 'month').format('YYYY'),
        "bankReferenceNumberRequiredForIssuance" : true,
        "issueFacilityDetailsProvided" : true,
        "disbursementAmount": "1,234.00",
        "bankReferenceNumber": "5678",
        "status": "Ready for check",
      },
    ]
  },
  "summary" : { },
  "comments" : [],
  "editedBy" : [],
  "dealFiles" : {
    "validationErrors" : {
      "count" : 0,
        "errorList" : {
        "exporterQuestionnaire" : { }
      }
    },
    "exporterQuestionnaire" : [
      {
        "type": "general_correspondence",
        "fullPath": "private-files/ukef_portal_storage/1001000/questionnaire.pdf",
        "filename": "questionnaire.pdf",
        "mimetype": "application/pdf"
      }
    ],
      "security" : ""
  }
};

export default deal;
