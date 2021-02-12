const moment = require('moment');

const deal = {
  "_id" : "1000923",
    "details" : {
    "status" : "Draft",
      "bankSupplyContractID" : "DTFS2-2766",
        "bankSupplyContractName" : "DTFS2-2766",
      "dateOfLastAction": moment().utc().valueOf(),
            "submissionType" : "Manual Inclusion Application",
              "maker" : {
      "_id" : "5f3ab3f705e6630007dcfb25",
        "username" : "maker1@ukexportfinance.gov.uk",
          "roles" : [
            "maker"
          ],
            "bank" : {
        "id" : "956",
          "name" : "Barclays Bank",
            "emails" : [
              "maker4@ukexportfinance.gov.uk",
              "checker4@ukexportfinance.gov.uk"
            ]
      },
      "lastLogin" : "1607086212158",
        "firstname" : "Hugo",
          "surname" : "Drax",
            "email" : "maker1@ukexportfinance.gov.uk",
              "timezone" : "Europe/London",
                "user-status" : "active"
    },
    "owningBank" : {
      "id" : "956",
        "name" : "Barclays Bank",
          "emails" : [
            "maker4@ukexportfinance.gov.uk",
            "checker4@ukexportfinance.gov.uk"
          ]
    },
      "created": moment().utc().valueOf(),
  },
  "eligibility" : {
    "status" : "Completed",
      "criteria" : [
        {
          "_id": "5f3bd4c19b84262f37a97fdc",
          "id": 11,
          "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.",
          "answer": true
        },
        {
          "_id": "5f3bd4d79b84262f37a97fdd",
          "id": 12,
          "description": "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.",
          "answer": false
        },
        {
          "_id": "5f3bd4ec9b84262f37a97fde",
          "id": 13,
          "description": "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).",
          "answer": true
        },
        {
          "_id": "5f3bd4fa9b84262f37a97fdf",
          "id": 14,
          "description": "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.",
          "answer": true
        },
        {
          "_id": "5f3bd5079b84262f37a97fe0",
          "id": 15,
          "description": "The Requested Cover Start Date is no more than three months from the date of submission.",
          "answer": true
        },
        {
          "_id": "5f3bd5199b84262f37a97fe1",
          "id": 16,
          "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.",
          "answer": true
        },
        {
          "_id": "5f3bd5289b84262f37a97fe2",
          "id": 17,
          "description": "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.",
          "answer": true
        },
        {
          "_id": "5f3bd5379b84262f37a97fe3",
          "id": 18,
          "description": "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.",
          "answer": true
        }
      ],
        "agentName" : "",
          "agentAddressCountry" : "",
            "agentAddressLine1" : "",
              "agentAddressLine2" : "",
                "agentAddressLine3" : "",
                  "agentAddressTown" : "",
                    "agentAddressPostcode" : "",
                      "validationErrors" : {
      "count" : 0,
        "errorList" : {
        "11" : {
        },
        "12" : {
        },
        "13" : {
        },
        "14" : {
        },
        "15" : {
        },
        "16" : {
        },
        "17" : {
        },
        "18" : {
        },
        "agentName" : {
        },
        "agentAddressCountry" : {
        },
        "agentAddressLine1" : {
        },
        "agentAddressPostcode" : {
        },
        "agentAddressTown" : {
        }
      }
    }
  },
  "submissionDetails" : {
    "status" : "Incomplete",
      "supplier-type" : "Exporter",
        "supplier-companies-house-registration-number" : "",
          "supplier-name" : "DTFS2-2731-MIA issue form",
            "supplier-address-country" : {
      "name" : "Croatia",
        "code" : "HRV"
    },
    "supplier-address-line-1" : "DTFS2-2731-MIA issue form",
      "supplier-address-line-2" : "",
        "supplier-address-line-3" : "",
          "supplier-address-town" : "DTFS2-2731-MIA issue form",
            "supplier-address-postcode" : "",
              "supplier-correspondence-address-is-different" : "false",
                "supplier-correspondence-address-country" : {
      "name" : null,
        "code" : null
    },
    "supplier-correspondence-address-line-1" : "",
      "supplier-correspondence-address-line-2" : "",
        "supplier-correspondence-address-line-3" : "",
          "supplier-correspondence-address-town" : "",
            "supplier-correspondence-address-postcode" : "",
              "industry-sector" : {
      "code" : "1018",
        "name" : "Other service activities"
    },
    "industry-class" : {
      "code" : "95110",
        "name" : "Repair of computers and peripheral equipment"
    },
    "sme-type" : "Medium",
      "supply-contract-description" : "DTFS2-2731-MIA issue form",
        "legallyDistinct" : "false",
          "indemnifier-companies-house-registration-number" : "",
            "indemnifier-name" : "",
              "indemnifier-address-country" : {
      "name" : null,
        "code" : null
    },
    "indemnifier-address-line-1" : "",
      "indemnifier-address-line-2" : "",
        "indemnifier-address-line-3" : "",
          "indemnifier-address-town" : "",
            "indemnifier-address-postcode" : "",
              "indemnifier-correspondence-address-country" : {
      "name" : null,
        "code" : null
    },
    "indemnifier-correspondence-address-line-1" : "",
      "indemnifier-correspondence-address-line-2" : "",
        "indemnifier-correspondence-address-line-3" : "",
          "indemnifier-correspondence-address-town" : "",
            "indemnifier-correspondence-address-postcode" : "",
              "indemnifierCorrespondenceAddressDifferent" : "",
                "buyer-name" : "DTFS2-2731-MIA issue form",
                  "buyer-address-country" : {
      "name" : "Colombia",
        "code" : "COL"
    },
    "buyer-address-line-1" : "DTFS2-2731-MIA issue form",
      "buyer-address-line-2" : "",
        "buyer-address-line-3" : "",
          "buyer-address-town" : "DTFS2-2731-MIA issue form",
            "buyer-address-postcode" : "",
              "destinationOfGoodsAndServices" : {
      "name" : "Guyana",
        "code" : "GUY"
    },
    "supplyContractValue" : "10000000.00",
      "supplyContractCurrency" : {
      "text" : "GBP - UK Sterling",
        "id" : "GBP"
    },
    "supplyContractConversionRateToGBP" : "",
      "supplyContractConversionDate-day" : "",
        "supplyContractConversionDate-month" : "",
          "supplyContractConversionDate-year" : ""
  },
  "mockFacilities" : [
    {
      "facilityType": "bond",
      "facilityStage": "Unissued",
      "ukefGuaranteeInMonths": "24",
      "facilityValue": "100000.00",
      "currencySameAsSupplyContractCurrency": "true",
      "createdDate": moment().utc().valueOf(),
      "lastEdited": moment().utc().valueOf(),
      "bondIssuer": "",
      "bondType": "Advance payment guarantee",
      "bondBeneficiary": "",
      "guaranteeFeePayableByBank": "1.8000",
      "ukefExposure": "80,000.00",
      "riskMarginFee": "2",
      "coveredPercentage": "80",
      "minimumRiskMarginFee": "",
      "feeType": "At maturity",
      "dayCountBasis": "365",
      "currency": {
        "text": "GBP - UK Sterling",
        "id": "GBP"
      }
    },
    {
      "facilityType": "bond",
      "facilityStage": "Unissued",
      "ukefGuaranteeInMonths": "24",
      "facilityValue": "100000.00",
      "currencySameAsSupplyContractCurrency": "true",
      "createdDate": moment().utc().valueOf(),
      "lastEdited": moment().utc().valueOf(),
      "bondIssuer": "",
      "bondType": "Performance bond",
      "bondBeneficiary": "",
      "guaranteeFeePayableByBank": "1.8000",
      "ukefExposure": "80,000.00",
      "riskMarginFee": "2",
      "coveredPercentage": "80",
      "minimumRiskMarginFee": "",
      "feeType": "At maturity",
      "dayCountBasis": "365",
      "currency": {
        "text": "GBP - UK Sterling",
        "id": "GBP"
      }
    },
    {
      "facilityType": "loan",
      "ukefGuaranteeInMonths": "24",
      "bankReferenceNumber": "",
      "facilityValue": "100000.00",
      "currencySameAsSupplyContractCurrency": "true",
      "createdDate": moment().utc().valueOf(),
      "lastEdited": moment().utc().valueOf(),
      "facilityStage": "Conditional",
      "guaranteeFeePayableByBank": "1.8000",
      "ukefExposure": "80,000.00",
      "interestMarginFee": "2",
      "coveredPercentage": "80",
      "minimumQuarterlyFee": "",
      "premiumType": "At maturity",
      "dayCountBasis": "365",
      "currency": {
        "text": "GBP - UK Sterling",
        "id": "GBP"
      }
    },
    {
      "facilityType": "loan",
      "ukefGuaranteeInMonths": "24",
      "bankReferenceNumber": "",
      "facilityValue": "100000.00",
      "currencySameAsSupplyContractCurrency": "true",
      "createdDate": moment().utc().valueOf(),
      "lastEdited": moment().utc().valueOf(),
      "facilityStage": "Conditional",
      "guaranteeFeePayableByBank": "1.8000",
      "ukefExposure": "80,000.00",
      "interestMarginFee": "2",
      "coveredPercentage": "80",
      "minimumQuarterlyFee": "",
      "premiumType": "At maturity",
      "dayCountBasis": "365",
      "currency": {
        "text": "GBP - UK Sterling",
        "id": "GBP"
      },
    },
  ],
  "summary" : {
  },
  "comments" : [],
    "editedBy": [],
      "mandatoryCriteria" : [
        {
          "_id": "5f2ad3fff0695800076ee515",
          "id": "1",
          "title": "Supply contract/Transaction",
          "items": [
            {
              "id": 1,
              "copy": "The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate."
            },
            {
              "id": 2,
              "copy": "The Bank has complied with its policies and procedures in relation to the Transaction."
            },
            {
              "id": 3,
              "copy": "Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)"
            }
          ]
        },
        {
          "_id": "5f2ad3fff0695800076ee516",
          "id": "2",
          "title": "Financial",
          "items": [
            {
              "id": 4,
              "copy": "The Bank Customer (to include both the Supplier and any Parent Obligor) is an <a href=\"/financial_difficulty_model_1.1.0.xlsx\" class=\"govuk-link\">Eligible Person spreadsheet</a>"
            }
          ]
        },
        {
          "_id": "5f2ad400f0695800076ee517",
          "id": "3",
          "title": "Credit",
          "items": [
            {
              "id": 5,
              "copy": "The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%."
            }
          ]
        },
        {
          "_id": "5f2ad400f0695800076ee518",
          "id": "4",
          "title": "Bank Facility Letter",
          "items": [
            {
              "id": 6,
              "copy": "The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland."
            }
          ]
        },
        {
          "_id": "5f2ad400f0695800076ee519",
          "id": "5",
          "title": "Legal",
          "items": [
            {
              "id": 7,
              "copy": "The Bank is the sole and beneficial owner of, and has legal title to, the Transaction."
            },
            {
              "id": 8,
              "copy": "The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction."
            },
            {
              "id": 9,
              "copy": "The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person."
            },
            {
              "id": 10,
              "copy": "The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction."
            }
          ]
        }
      ],
        "dealFiles" : {
    "validationErrors" : {
      "count" : 0,
        "errorList" : {
        "exporterQuestionnaire" : {
        }
      }
    },
    "security" : "",
      "exporterQuestionnaire" : [
        {
          "type": "general_correspondence",
          "fullPath": "portal_storage/1000896/File One.docx",
          "filename": "File One.docx",
          "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      ]
  },
  "ukefComments" : [],
    "specialConditions" : []
}

export default deal;
