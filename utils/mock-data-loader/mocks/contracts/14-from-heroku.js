const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');
module.exports = {
    "details" : {
        "status" : "Draft",
        "bankSupplyContractID" : "DTFS2-1232-004",
        "bankSupplyContractName" : "DTFS2-1232-004",
        "created" : "1594818705065",
        "dateOfLastAction" : "1594820857454",
        "maker" : {
            "username" : "MAKER",
            "roles" : [
                "maker"
            ],
            "bank" : {
                "id" : "956",
                "name" : "Barclays Bank",
                "emails": [
                    "maker4@ukexportfinance.gov.uk",
                    "checker4@ukexportfinance.gov.uk"
                ]
            },
            "lastLogin" : "1594818593437",
            "firstname" : "Hugo",
            "surname" : "Drax",
            "timezone" : "Europe/London",
        },
        "owningBank" : {
            "id" : "956",
            "name" : "Barclays Bank",
            "emails": [
                "maker4@ukexportfinance.gov.uk",
                "checker4@ukexportfinance.gov.uk"
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
        "industry-class" : "",
        "industry-sector" : "",
        "supplier-address-country" : {
            "code" : "GBR",
            "name" : "United Kingdom"
        },
        "supplier-address-line-1" : "",
        "supplier-address-line-2" : "",
        "supplier-address-line-3" : "",
        "supplier-address-postcode" : "",
        "supplier-address-town" : "",
        "supplier-companies-house-registration-number" : "",
        "supplier-correspondence-address-country" : {
            "code" : "GBR",
            "name" : "United Kingdom"
        },
        "supplier-correspondence-address-line-1" : "",
        "supplier-correspondence-address-line-2" : "",
        "supplier-correspondence-address-line-3" : "",
        "supplier-correspondence-address-postcode" : "",
        "supplier-correspondence-address-town" : "",
        "supplier-name" : "sdfsdfdsfsdfsdkfnksdfnksdklfnsdlkfnlksdfnkdsfnkldskfsdklfnkdflkndfsdlkfnlkfnkdsfnksdfnknfkln1849826349862983469826438926348962983469832649832649862389469832649832649862398469823469823468326498263489362498623984698236486239486239846298346982349jdbfkjbsdfbjsbdfjsdjfbjfbsdfbnmsdbfmnsdbfmnbdfnmbsdfnbdsfdfbnsbnms8yr9823489623894698469863498623498692384698324689264892634986234896389469283649823649862348623948639284698236498236482634986238946928364283946982364983264983649836498263498623498693284698236498324",
        "supplier-type" : "",
        "supply-contract-description" : ""
    },
    "bondTransactions" : {
        "items" : [
            {
                "bondIssuer" : "Max data on bond issuser - 1234/56789. Qwertyuiopasdfghjklzxcvbnm. 01234567890123456789012334345834958638465983659863948569384659836459864598634985639",
                "bondType" : "Performance bond",
                "bondStage" : "Unissued",
                "ukefGuaranteeInMonths" : "60",
                "bondBeneficiary" : "Bond beneficiary - 123/456. jdfjsdvfsdvfvsdfvh186239861963912863961 2367234872638472875348725348732548752387548723548752387458273548723548723745283754",
                "guaranteeFeePayableByBank" : "2.9250",
                "facilityValue" : "98765432109876.06",
                "currencySameAsSupplyContractCurrency" : "false",
                "currency" : {
                    "text" : "CNY - Chinese Yuan Renminbi",
                    "id" : "CNY"
                },
                "conversionRate" : "1.123456",
                "conversionRateDate-day" : "01",
                "conversionRateDate-month" : "07",
                "conversionRateDate-year" : "2020",
                "riskMarginFee" : "3.25",
                "coveredPercentage" : "70.09",
                "minimumRiskMarginFee" : "1234.99",
                "ukefExposure" : "69,224,691,365,812.14",
                "feeFrequency" : "Monthly",
                "feeType" : "In advance",
                "dayCountBasis" : "360"
            },
            {
                "bondIssuer" : "",
                "bondType" : "Bid bond",
                "bondStage" : "Unissued",
                "ukefGuaranteeInMonths" : "10",
                "bondBeneficiary" : "",
                "guaranteeFeePayableByBank" : "1.0109",
                "facilityValue" : "100000.00",
                "currencySameAsSupplyContractCurrency" : "true",
                "riskMarginFee" : "1.1232",
                "coveredPercentage" : "80",
                "minimumRiskMarginFee" : "",
                "ukefExposure" : "80,000.00",
                "feeType" : "At maturity",
                "dayCountBasis" : "365"
            },
            {
                "bondIssuer" : "Issued Bond - Bond isuer field. 123/456. 2349826349863294290748639486298649826349862398462893649823649826394862938649823649826394862938649286349862END",
                "bondType" : "Progress payment bond",
                "bondStage" : "Issued",
                "requestedCoverStartDate-day" : "01",
                "requestedCoverStartDate-month" : "08",
                "requestedCoverStartDate-year" : "2020",
                "coverEndDate-day" : "22",
                "coverEndDate-month" : "02",
                "coverEndDate-year" : "2025",
                "uniqueIdentificationNumber" : "Bond 's unique id - 634/93864. owiefohwukbfjw8249862398469286349862936498623986489236498623984698236498623984623986498236489263489632864826348638924683926END",
                "bondBeneficiary" : "Bond ben - 92634/93864. owiefohwukbfjw8249862398469286349862936498623986489236498623984698236498623984623986498236489263489632864826348638924683926END",
                "guaranteeFeePayableByBank" : "2.8111",
                "facilityValue" : "12345678901234.99",
                "currencySameAsSupplyContractCurrency" : "false",
                "currency" : {
                    "text" : "DZD - Algerian Dinar",
                    "id" : "DZD"
                },
                "conversionRate" : "0.098765",
                "conversionRateDate-day" : "01",
                "conversionRateDate-month" : "07",
                "conversionRateDate-year" : "2020",
                "riskMarginFee" : "3.123456",
                "coveredPercentage" : "70.88",
                "minimumRiskMarginFee" : "1000.12",
                "ukefExposure" : "8,750,617,205,195.36",
                "feeFrequency" : "Semi-annually",
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
