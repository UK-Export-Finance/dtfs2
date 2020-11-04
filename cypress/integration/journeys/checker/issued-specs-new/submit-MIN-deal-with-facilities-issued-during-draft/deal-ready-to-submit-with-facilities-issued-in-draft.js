const moment = require('moment');

const deal = {
  "_id": "1042317",
  "details": {
    "status": "Ready for Checker's approval",
    "bankSupplyContractID": "TEST",
    "bankSupplyContractName": "TESTING",
    "created": moment().utc().valueOf(),
    "dateOfLastAction": moment().utc().valueOf(),
    "maker": {
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
      "lastLogin": "1604493209454",
      "firstname": "Hugo",
      "surname": "Drax",
      "email": "maker@ukexportfinance.gov.uk",
      "timezone": "Europe/London",
      "user-status": "active",
    },
    "owningBank": {
      "id": "956",
      "name": "Barclays Bank",
      "emails": [
        "maker4@ukexportfinance.gov.uk",
        "checker4@ukexportfinance.gov.uk"
      ]
    },
    "submissionType": "Automatic Inclusion Notice",
    "previousStatus": "Draft"
  },
  "eligibility": {
    "status": "Completed",
    "criteria": [
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
    "agentAddressCountry": "",
    "agentAddressLine1": "",
    "agentAddressLine2": "",
    "agentAddressLine3": "",
    "agentAddressPostcode": "",
    "agentAddressTown": "",
    "agentName": "",
    "validationErrors": {
      "count": 0,
      "errorList": {
        "11": {},
        "12": {},
        "13": {},
        "14": {},
        "15": {},
        "16": {},
        "17": {},
        "18": {},
        "agentAddressCountry": {},
        "agentAddressLine1": {},
        "agentAddressPostcode": {},
        "agentAddressTown": {},
        "agentName": {}
      }
    }
  },
  "submissionDetails": {
    "status": "Incomplete",
    "indemnifier-address-country": {},
    "indemnifier-address-line-1": "",
    "indemnifier-address-line-2": "",
    "indemnifier-address-line-3": "",
    "indemnifier-address-postcode": "",
    "indemnifier-address-town": "",
    "indemnifier-companies-house-registration-number": "",
    "indemnifier-correspondence-address-country": {},
    "indemnifier-correspondence-address-line-1": "",
    "indemnifier-correspondence-address-line-2": "",
    "indemnifier-correspondence-address-line-3": "",
    "indemnifier-correspondence-address-postcode": "",
    "indemnifier-correspondence-address-town": "",
    "indemnifier-name": "",
    "indemnifierCorrespondenceAddressDifferent": "",
    "industry-class": "56210",
    "industry-sector": "1008",
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
    "supplier-correspondence-address-country": {},
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
  "bondTransactions": {
    "items": [
      {
        "_id": "1018199",
        "createdDate": moment().utc().valueOf(),
        "bondIssuer": "",
        "bondType": "Advance payment guarantee",
        "facilityStage": "Issued",
        "requestedCoverStartDate-day": 4,
        "requestedCoverStartDate-month": 11,
        "requestedCoverStartDate-year": 2020,
        "coverEndDate-day": "12",
        "coverEndDate-month": "11",
        "coverEndDate-year": "2020",
        "uniqueIdentificationNumber": "1234",
        "bondBeneficiary": "",
        "guaranteeFeePayableByBank": "10.8000",
        "lastEdited": moment().utc().valueOf(),
        "facilityValue": "1234.00",
        "currencySameAsSupplyContractCurrency": "true",
        "riskMarginFee": "12",
        "coveredPercentage": "24",
        "minimumRiskMarginFee": "",
        "ukefExposure": "296.16",
        "feeType": "At maturity",
        "dayCountBasis": "365",
        "currency": {
          "text": "GBP - UK Sterling",
          "id": "GBP"
        },
        "requestedCoverStartDate": moment().utc().valueOf(),
      }
    ]
  },
  "loanTransactions": {
    "items": [
      {
        "_id": "1018200",
        "createdDate": moment().utc().valueOf(),
        "facilityStage": "Unconditional",
        "requestedCoverStartDate-day": 4,
        "requestedCoverStartDate-month": 11,
        "requestedCoverStartDate-year": 2020,
        "coverEndDate-day": "12",
        "coverEndDate-month": "11",
        "coverEndDate-year": "2020",
        "bankReferenceNumber": "1234",
        "guaranteeFeePayableByBank": "10.8000",
        "lastEdited": moment().utc().valueOf(),
        "facilityValue": "1234.00",
        "currencySameAsSupplyContractCurrency": "true",
        "disbursementAmount": "1234.00",
        "interestMarginFee": "12",
        "coveredPercentage": "24",
        "minimumQuarterlyFee": "",
        "ukefExposure": "296.16",
        "premiumType": "At maturity",
        "dayCountBasis": "365",
        "currency": {
          "text": "GBP - UK Sterling",
          "id": "GBP"
        },
        "requestedCoverStartDate": moment().utc().valueOf(),
      }
    ]
  },
  "summary": {},
  "comments": [
    {
      "user": {
        "username": "MAKER",
        "roles": [
          "maker"
        ],
        "bank": {
          "id": "956",
          "name": "Barclays Bank",
          "emails": [
            "maker4@ukexportfinance.gov.uk",
            "checker4@ukexportfinance.gov.uk"
          ]
        },
        "lastLogin": "1604493209454",
        "firstname": "Hugo",
        "surname": "Drax",
        "email": "maker@ukexportfinance.gov.uk",
        "timezone": "Europe/London",
        "user-status": "active",
      },
      "timestamp": "1604493332767",
      "text": "test"
    }
  ],
  "editedBy": [
    {
      "date": "1604493239448",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493247537",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493253566",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493264350",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493273347",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493281870",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493292656",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493302306",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493305970",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493307943",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493316741",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493323296",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493326956",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    },
    {
      "date": "1604493332799",
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
    }
  ],
  "mandatoryCriteria": [
    {
      "_id": "5fa29f78612b4600e167be69",
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
      "_id": "5fa29f78612b4600e167be6a",
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
      "_id": "5fa29f78612b4600e167be6b",
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
      "_id": "5fa29f78612b4600e167be6c",
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
      "_id": "5fa29f78612b4600e167be6d",
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
  "dealFiles": {
    "validationErrors": {
      "count": 0,
      "errorList": {
        "exporterQuestionnaire": {}
      }
    },
    "exporterQuestionnaire": [
      {
        "type": "general_correspondence",
        "fullPath": "private-files/ukef_portal_storage/1042317/questionnaire.pdf",
        "filename": "questionnaire.pdf",
        "mimetype": "application/pdf"
      }
    ],
    "security": ""
  }
};

module.exports = deal;
