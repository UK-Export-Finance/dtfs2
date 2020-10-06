const moment = require('moment');

const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');

const now = moment();
const aMonthFromNow = moment().add(1, 'month');

module.exports = {
  bankSupplyContractName: 'UKEF plc',
  "details": {
    "bank": {
      "id" : "956",
      "name" : "Barclays Bank",
      "emails": [
        "maker4@ukexportfinance.gov.uk",
        "checker4@ukexportfinance.gov.uk"
      ]
    },
    "bankSupplyContractID": "DTFS2-1092-deal-in-good-state",
    "bankSupplyContractName": "Tibettan submarine acquisition scheme",
    "submissionType": "Automatic Inclusion Notice",
    "previousStatus": "Draft",
    "status": "Ready for Checker's approval",
    owningBank: {
      id: '956',
      name: 'Barclays Bank',
      "emails": [
        "maker4@ukexportfinance.gov.uk",
        "checker4@ukexportfinance.gov.uk"
      ]
    },
  },
  "submissionDetails" : {
    "indemnifier-address-country" : "GBR",
    "indemnifier-address-line-3" : "",
    "indemnifier-address-line-1" : "27a",
    "indemnifier-address-line-2" : "Maxwell Road",
    "indemnifier-address-postcode" : "HA6 2XY",
    "indemnifier-address-town" : "Northwood",
    "indemnifier-companies-house-registration-number" : "08547313",
    "indemnifier-correspondence-address-country" : "GBR",
    "indemnifier-correspondence-address-line-3" : "Essex",
    "indemnifier-correspondence-address-line-1" : "27 Petersfield",
    "indemnifier-correspondence-address-line-2" : "",
    "indemnifier-correspondence-address-postcode" : "CM1 4EP",
    "indemnifier-correspondence-address-town" : "Chelmsford",
    "indemnifier-name" : "WATKINSON TRADING LIMITED",
    "indemnifierCorrespondenceAddressDifferent" : "true",
    "industry-sector" : "1008",
    "industry-class" : "56210",
    "legallyDistinct" : "true",
    "sme-type" : "Small",
    "supplier-address-country" : "GBR",
    "supplier-address-line-3" : "London",
    "supplier-address-line-1" : "1 Horseguards Road",
    "supplier-address-line-2" : "",
    "supplier-address-postcode" : "SW1A 2HQ",
    "supplier-address-town" : "Westminster",
    "supplier-companies-house-registration-number" : "",
    "supplier-correspondence-address-country" : "GBR",
    "supplier-correspondence-address-line-3" : "Edinburgh",
    "supplier-correspondence-address-line-1" : "2 Horseguards Road",
    "supplier-correspondence-address-line-2" : "",
    "supplier-correspondence-address-postcode" : "ED1 23S",
    "supplier-correspondence-address-town" : "Eastminster",
    "supplier-name" : "UKFS",
    "supplier-type" : "Exporter",
    "supplier-correspondence-address-is-different" : "true",
    "supply-contract-description" : "Description.",
    "buyer-address-country" : "USA",
    "buyer-address-line-1" : "Corner of East and Main",
    "buyer-address-line-2" : "",
    "buyer-address-line-3" : "The Bronx",
    "buyer-address-postcode" : "no-idea",
    "buyer-address-town" : "New York",
    "buyer-name" : "Huggy Bear",
    "destinationOfGoodsAndServices" : "USA",
    "viewedPreviewPage" : true,
    "supplyContractConversionRateToGBP" : "1.123456",
    "supplyContractCurrency" : {
        "id" : "USD",
        "text": "USD - US Dollars"
    },
    "supplyContractValue" : "10,000",
    "supplyContractConversionDate-day" : `${now.format('DD')}`,
    "supplyContractConversionDate-month" : `${now.format('MM')}`,
    "supplyContractConversionDate-year" : `${now.format('YYYY')}`,
  },
  "eligibility": {
    "status": "Completed",
    "criteria": [
      { "id": 11, "answer": true
      },
      { "id": 12, "answer": true
      },
      { "id": 13, "answer": true
      },
      { "id": 14, "answer": true
      },
      { "id": 15, "answer": true
      },
      { "id": 16, "answer": true
      },
      { "id": 17, "answer": true
      },
      { "id": 18, "answer": true
      }
    ],
  },
  "bondTransactions": {
    "items": [
      {
        "_id": 4,
        "bondIssuer": "issuer",
        "bondType": "bond type",
        "facilityStage": "Unissued",
        "ukefGuaranteeInMonths": "24",
        "uniqueIdentificationNumber": "1234",
        "bondBeneficiary": "test",
        "facilityValue": "123",
        "currencySameAsSupplyContractCurrency": "true",
        "riskMarginFee": "1",
        "coveredPercentage": "2",
        "feeType": "test",
        "feeFrequency": "test",
        "dayCountBasis": "test"
      }
    ]
  },
  "loanTransactions": {
    "items": [
      {
        "_id": 3,
        "facilityStage": "Unconditional",
        "bankReferenceNumber": "123",
        "facilityValue": "123",
        "disbursementAmount": "12",
        "currencySameAsSupplyContractCurrency": "true",
        "interestMarginFee": "10",
        "coveredPercentage": "9",
        "requestedCoverStartDate-day" : `${now.format('DD')}`,
        "requestedCoverStartDate-month" : `${now.format('MM')}`,
        "requestedCoverStartDate-year" : `${now.format('YYYY')}`,
        "coverEndDate-day" : `${aMonthFromNow.format('DD')}`,
        "coverEndDate-month" : `${aMonthFromNow.format('MM')}`,
        "coverEndDate-year" : `${aMonthFromNow.format('YYYY')}`,
      }
    ]
  },
}
