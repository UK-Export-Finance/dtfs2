const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');
module.exports = {
    "details" : {
        "status" : "Further Maker's input required",
        "bankSupplyContractID" : "DTFS2-1245--010",
        "bankSupplyContractName" : "DTFS2-1245--010",
        "created" : "1595576985424",
        "dateOfLastAction" : "1595583452092",
        "maker" : {
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
            "lastLogin" : "1595576594831",
            "firstname" : "Hugo",
            "surname" : "Drax",
            "timezone" : "Europe/London",
        },
        "owningBank" : {
            "id" : "956",
            "name" : "Barclays Bank"
        },
        "submissionType" : "Automatic Inclusion Notice",
        "previousStatus" : "Ready for Checker's approval",
        "previousWorkflowStatus" : "Draft"
    },
    "eligibility" : {
        "status" : "Completed",
        "criteria" : [
            {
                "id" : 11,
                "description" : "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.",
                "answer" : true
            },
            {
                "id" : 12,
                "description" : "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.",
                "answer" : true
            },
            {
                "id" : 13,
                "description" : "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).",
                "answer" : true
            },
            {
                "id" : 14,
                "description" : "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.",
                "answer" : true
            },
            {
                "id" : 15,
                "description" : "The Requested Cover Start Date is no more than three months from the date of submission.",
                "answer" : true
            },
            {
                "id" : 16,
                "description" : "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.",
                "answer" : true
            },
            {
                "id" : 17,
                "description" : "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.",
                "answer" : true
            },
            {
                "id" : 18,
                "description" : "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.",
                "answer" : true
            }
        ],
        "agentAddressLine1" : "",
        "agentAddressLine2" : "",
        "agentAddressLine3" : "",
        "agentAddressCountry" : "",
        "agentName" : "",
        "agentAddressPostcode" : "",
        "agentAddressTown" : "",
        "validationErrors" : {
            "count" : 0,
            "errorList" : {
                "11" : {},
                "12" : {},
                "13" : {},
                "14" : {},
                "15" : {},
                "16" : {},
                "17" : {},
                "18" : {},
                "agentAddressLine1" : {},
                "agentAddressCountry" : {},
                "agentName" : {},
                "agentAddressPostcode" : {},
                "agentAddressTown" : {}
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
        "industry-class" : "84110",
        "industry-sector" : "1014",
        "legallyDistinct" : "false",
        "sme-type" : "Small",
        "supplier-address-country" : {
            "code" : "GBR",
            "name" : "United Kingdom"
        },
        "supplier-address-line-1" : "Test",
        "supplier-address-line-2" : "",
        "supplier-address-line-3" : "",
        "supplier-address-postcode" : "Test",
        "supplier-address-town" : "",
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
        "supplier-name" : "Test",
        "supplier-type" : "Exporter",
        "supply-contract-description" : "Test",
        "buyer-address-country" : {
            "code" : "GBR",
            "name" : "United Kingdom"
        },
        "buyer-address-line-1" : "Test",
        "buyer-address-line-2" : "",
        "buyer-address-line-3" : "",
        "buyer-address-postcode" : "Test",
        "buyer-address-town" : "",
        "buyer-name" : "Test",
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
        "supplyContractValue" : "70000000.00",
        "hasBeenPreviewed" : true
    },
    "bondTransactions" : {
        "items" : [
            {
                "bondIssuer" : "",
                "bondType" : "Performance bond",
                "bondStage" : "Issued",
                "requestedCoverStartDate-day" : "",
                "requestedCoverStartDate-month" : "",
                "requestedCoverStartDate-year" : "",
                "coverEndDate-day" : "10",
                "coverEndDate-month" : "10",
                "coverEndDate-year" : "2026",
                "uniqueIdentificationNumber" : "BondIDEdit",
                "bondBeneficiary" : "",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "200000.00",
                "currencySameAsSupplyContractCurrency" : "true",
                "riskMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumRiskMarginFee" : "",
                "ukefExposure" : "160,000.00",
                "feeType" : "At maturity",
                "dayCountBasis" : "360",
                "status" : "Completed",
                "viewedPreviewPage" : true,
                "currency" : {
                    "text" : "GBP - UK Sterling",
                    "id" : "GBP"
                }
            },
            {
                "bondIssuer" : "",
                "bondType" : "Bid bond",
                "bondStage" : "Unissued",
                "ukefGuaranteeInMonths" : "50",
                "bondBeneficiary" : "",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "250000.00",
                "currencySameAsSupplyContractCurrency" : "true",
                "riskMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumRiskMarginFee" : "",
                "ukefExposure" : "200,000.00",
                "feeType" : "At maturity",
                "dayCountBasis" : "365",
                "status" : "Completed",
                "viewedPreviewPage" : true,
                "currency" : {
                    "text" : "GBP - UK Sterling",
                    "id" : "GBP"
                }
            }
        ]
    },
    "loanTransactions" : {
        "items" : [
            {
                "facilityStage" : "Unconditional",
                "requestedCoverStartDate-day" : "24",
                "requestedCoverStartDate-month" : "07",
                "requestedCoverStartDate-year" : "2020",
                "coverEndDate-day" : "1",
                "coverEndDate-month" : "1",
                "coverEndDate-year" : "2025",
                "bankReferenceNumber" : "LoanIDEdit",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "100000.00",
                "currencySameAsSupplyContractCurrency" : "true",
                "disbursementAmount" : "1000.00",
                "interestMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumQuarterlyFee" : "",
                "ukefExposure" : "80,000.00",
                "premiumType" : "At maturity",
                "dayCountBasis" : "365"
            },
            {
                "facilityStage" : "Conditional",
                "ukefGuaranteeInMonths" : "60",
                "bankReferenceNumber" : "",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "100000.50",
                "currencySameAsSupplyContractCurrency" : "true",
                "interestMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumQuarterlyFee" : "",
                "ukefExposure" : "80,000.40",
                "premiumType" : "At maturity",
                "dayCountBasis" : "365",
                "currency" : {
                    "text" : "GBP - UK Sterling",
                    "id" : "GBP"
                }
            }
        ]
    },
    "summary" : {},
    "comments" : [
        {
            "user" : {
                "username" : "CHECKER",
                "roles" : [
                    "checker"
                ],
                "bank" : {
                    "id" : "956",
                    "name" : "Barclays Bank"
                },
                "lastLogin" : "1595583267490",
                "firstname" : "Emilio",
                "surname" : "Largo",
                "timezone" : "Europe/London",
            },
            "timestamp" : "1595583409513",
            "text" : "return"
        },
        {
            "user" : {
                "username" : "MAKER",
                "roles" : [
                    "maker"
                ],
                "bank" : {
                    "id" : "956",
                    "name" : "Barclays Bank"
                },
                "lastLogin" : "1595582951502",
                "firstname" : "Hugo",
                "surname" : "Drax",
                "timezone" : "Europe/London",
            },
            "timestamp" : "1595583239832",
            "text" : "test"
        },
        {
            "user" : {
                "username" : "CHECKER",
                "roles" : [
                    "checker"
                ],
                "bank" : {
                    "id" : "956",
                    "name" : "Barclays Bank"
                },
                "lastLogin" : "1595582658576",
                "firstname" : "Emilio",
                "surname" : "Largo",
                "timezone" : "Europe/London",
            },
            "timestamp" : "1595582944371",
            "text" : "test"
        },
        {
            "user" : {
                "username" : "MAKER",
                "roles" : [
                    "maker"
                ],
                "bank" : {
                    "id" : "956",
                    "name" : "Barclays Bank"
                },
                "lastLogin" : "1595581914389",
                "firstname" : "Hugo",
                "surname" : "Drax",
                "timezone" : "Europe/London",
            },
            "timestamp" : "1595582267164",
            "text" : "Test"
        }
    ],
    "editedBy" : [
        {
            "date" : "1595576999650",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577011523",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577021883",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577024936",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577027407",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577041443",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577055516",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595577058734",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582129592",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582133942",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582136866",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582154051",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582195874",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582220852",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582228677",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582241045",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582241162",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595582261312",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583017496",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583020028",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583039504",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583042758",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583049146",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583070327",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583074068",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583074172",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583080107",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583096767",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583109767",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583114719",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583114820",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583182208",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583192216",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583202174",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583432590",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583443584",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        },
        {
            "date" : "1595583452092",
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
        }
    ],
    "dealFiles" : {
        "validationErrors" : {
            "count" : 0,
            "errorList" : {
                "exporterQuestionnaire" : {}
            }
        }
    }
}
