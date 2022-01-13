const {
  nowTimestamp,
  twoMonths,
  twoMonthsTimestamp,
  threeMonths,
} = require('../dates');

module.exports = [
  {
    "mockDealId": 1,
    "facilityType": "Bond",
    "createdDate": nowTimestamp,
    "bondIssuer": "",
    "bondType": "Performance bond",
    "ukefGuaranteeInMonths": null,
    "facilityStage": "Issued",
    "hasBeenIssued": true,
    "requestedCoverStartDate-day": twoMonths.day,
    "requestedCoverStartDate-month": twoMonths.month,
    "requestedCoverStartDate-year": twoMonths.year,
    "coverEndDate-day": threeMonths.day,
    "coverEndDate-month": threeMonths.month,
    "coverEndDate-year": threeMonths.year,
    "uniqueIdentificationNumber": "Test Bond",
    "bondBeneficiary": "",
    "requestedCoverStartDate": twoMonthsTimestamp,
    "lastEdited": nowTimestamp,
    "value": "500000.00",
    "currencySameAsSupplyContractCurrency": "true",
    "currency": {
      "text": "GBP - UK Sterling",
      "id": "GBP",
      "currencyId": 12
    },
    "conversionRate": null,
    "conversionRateDate-day": null,
    "conversionRateDate-month": null,
    "conversionRateDate-year": null,
    "riskMarginFee": "2",
    "coveredPercentage": "80",
    "minimumRiskMarginFee": "",
    "guaranteeFeePayableByBank": "1.8000",
    "ukefExposure": "400,000.00",
    "feeFrequency": "Monthly",
    "feeType": "In arrear",
    "dayCountBasis": "365"
  },
];
