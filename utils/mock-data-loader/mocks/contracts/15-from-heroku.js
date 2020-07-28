const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');
module.exports = {
    "details" : {
        "status" : "Draft",
        "bankSupplyContractID" : "DTFS2-1232-022",
        "bankSupplyContractName" : "DTFS2-1232-022",
        "created" : "1595425832717",
        "dateOfLastAction" : "1595425832717",
        "maker" : {
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank"
            },
            "lastLogin" : "1595425761442",
            "firstname" : "Hugo",
            "surname" : "Drax",
            "timezone" : "Europe/London",
        },
        "owningBank" : {
            "id" : "956",
            "name" : "Barclays Bank",
            "emails": [
                "maker1@ukexportfinance.gov.uk",
            ]
        }
    },
    "eligibility" : {
        "status" : "Incomplete",
        "criteria" : [
            {
                "id" : 11,
                "description" : "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate."
            },
            {
                "id" : 12,
                "description" : "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor."
            },
            {
                "id" : 13,
                "description" : "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn)."
            },
            {
                "id" : 14,
                "description" : "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced."
            },
            {
                "id" : 15,
                "description" : "The Requested Cover Start Date is no more than three months from the date of submission."
            },
            {
                "id" : 16,
                "description" : "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate."
            },
            {
                "id" : 17,
                "description" : "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person."
            },
            {
                "id" : 18,
                "description" : "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF."
            }
        ]
    },
    "submissionDetails" : {
        "status" : "Not Started"
    },
    "bondTransactions" : {
        "items" : [
            {
                "bondIssuer" : "Unissued - Bond issuer field - 1234/5678 'test'. 1283981623861982369816329861238612386189236816238126386182361826381263861298361289368912639812638 END",
                "bondType" : "Advance payment guarantee",
                "bondStage" : "Unissued",
                "ukefGuaranteeInMonths" : "60",
                "bondBeneficiary" : "Bond beneficiary (optional) - 123/456. 83946283649826394862938469824682364986298346289364982634986293846982364982634982639486298346923864982648926 END",
                "guaranteeFeePayableByBank" : "1.1070",
                "facilityValue" : "12345678901234.99",
                "currencySameAsSupplyContractCurrency" : "false",
                "currency" : {
                    "text" : "EGP - Egyptian Pounds",
                    "id" : "EGP"
                },
                "conversionRate" : "1.234567",
                "conversionRateDate-day" : "01",
                "conversionRateDate-month" : "7",
                "conversionRateDate-year" : "2020",
                "riskMarginFee" : "1.23",
                "coveredPercentage" : "70.99",
                "minimumRiskMarginFee" : "1234.99",
                "ukefExposure" : "8,764,197,451,986.72",
                "feeFrequency" : "Monthly",
                "feeType" : "In advance",
                "dayCountBasis" : "360"
            },
            {
                "bondIssuer" : "",
                "bondType" : "Bid bond",
                "bondStage" : "Unissued",
                "ukefGuaranteeInMonths" : "50",
                "bondBeneficiary" : "",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "100000.00",
                "currencySameAsSupplyContractCurrency" : "true",
                "riskMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumRiskMarginFee" : "",
                "ukefExposure" : "80,000.00",
                "feeType" : "At maturity",
                "dayCountBasis" : "365"
            },
            {
                "bondIssuer" : "",
                "bondType" : "Retention bond",
                "bondStage" : "Issued",
                "requestedCoverStartDate-day" : "",
                "requestedCoverStartDate-month" : "",
                "requestedCoverStartDate-year" : "",
                "coverEndDate-day" : "1",
                "coverEndDate-month" : "1",
                "coverEndDate-year" : "2025",
                "uniqueIdentificationNumber" : "Bond ID",
                "bondBeneficiary" : "",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "350000.00",
                "currencySameAsSupplyContractCurrency" : "false",
                "currency" : {
                    "text" : "NOK - Norwegian Krone",
                    "id" : "NOK"
                },
                "conversionRate" : "2.12",
                "conversionRateDate-day" : "10",
                "conversionRateDate-month" : "07",
                "conversionRateDate-year" : "2020",
                "riskMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumRiskMarginFee" : "100.99",
                "ukefExposure" : "280,000.00",
                "feeType" : "At maturity",
                "dayCountBasis" : "365"
            },
            {
                "bondIssuer" : "Bond Issuer (optional) - Issued Bond.8237482734872843723847823748728347823748273487243873287498273498273489723847289374897248972384784379823748723 END",
                "bondType" : "Warranty letter",
                "bondStage" : "Issued",
                "requestedCoverStartDate-day" : "11",
                "requestedCoverStartDate-month" : "08",
                "requestedCoverStartDate-year" : "2020",
                "coverEndDate-day" : "03",
                "coverEndDate-month" : "09",
                "coverEndDate-year" : "2025",
                "uniqueIdentificationNumber" : "Change ID",
                "bondBeneficiary" : "Bond beneficiary (optional) - 'test'. 298348926346298364823698462983468236489623846289346982364986293846823648926348962398469823649826348962893649 END",
                "guaranteeFeePayableByBank" : "2.7000",
                "facilityValue" : "98765432109876.50",
                "currencySameAsSupplyContractCurrency" : "false",
                "currency" : {
                    "text" : "ZMK - Zambian Kwacha",
                    "id" : "ZMK"
                },
                "conversionRate" : "1.99",
                "conversionRateDate-day" : "20",
                "conversionRateDate-month" : "07",
                "conversionRateDate-year" : "2020",
                "riskMarginFee" : "3",
                "coveredPercentage" : "80",
                "minimumRiskMarginFee" : "",
                "ukefExposure" : "79,012,345,687,901.20",
                "feeFrequency" : "Annually",
                "feeType" : "In arrear",
                "dayCountBasis" : "365"
            }
        ]
    },
    "loanTransactions" : {
        "items" : []
    },
    "summary" : {},
    "comments" : []
}
