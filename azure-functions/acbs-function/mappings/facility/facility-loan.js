/*
"postingDate"                      Date of submission to ACBS
"borrowerPartyIdentifier"          exporter ACBS ID
"productTypeId"                    Facility type ID
"productTypeGroup"                 Facility product group type
"currency"                         Facility currency code
"dealCustomerUsageRate"            This is Currency exchange rate (FX rate)
"dealCustomerUsageOperationType"   This is Currency exchange rate operation (D for divide)
"amount"                           UKEF facility maximum exposure
"issueDate"                        At Commitment stage its not required, issued when issued it would be Issue Date for Bond OR Disbursement Date for Loan
"expiryDate"                       Facility expiry date
"spreadRate"                       Used for premium accrual schedule
"spreadRateCtl"                    Used for Contractual Interest Accrual Schedule (CTL).
"nextDueDate"                      guaranteeCommencementDate + Fee frequency in months
"yearBasis"                        dayCountBasis : 360 = 5, 365 = 1
"indexRateChangeFrequency"         Facility fee frequency type
"loanBillingFrequencyType"         Facility fee type
*/

const helpers = require('./helpers');
const date = require('../../helpers/date');
const CONSTANTS = require('../../constants');
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

/**
 * Maps the facility loan record for a given deal and facility.
 *
 * This function performs the following operations:
 * 1. Extracts the issue date and guarantee expiry date from the facility's guarantee dates.
 * 2. Retrieves the currency of the facility, defaulting to a constant if not provided.
 * 3. Calculates the maximum liability and other financial details using helper functions.
 * 4. Constructs and returns the facility loan record object.
 * 5. Adds additional fields if the facility is not in GBP.
 * 6. Adds specific fields for BSS/EWCS deals.
 *
 * @param {Object} deal - The deal object containing deal details.
 * @param {Object} deal.dealSnapshot - The snapshot of the deal details.
 * @param {string} deal.dealSnapshot.dealType - The type of the deal (e.g., GEF, BSS_EWCS).
 * @param {Object} facility - The facility object containing facility details.
 * @param {Object} facility.tfm - The TFM-specific details of the facility.
 * @param {Object} facility.tfm.facilityGuaranteeDates - The guarantee dates of the facility.
 * @param {Object} facility.tfm.exchangeRate - The exchange rate details of the facility.
 * @param {Object} facility.facilitySnapshot - The snapshot of the facility details.
 * @param {Object} facility.facilitySnapshot.currency - The currency details of the facility.
 * @param {number} facility.facilitySnapshot.guaranteeFee - The guarantee fee of the facility.
 * @param {number} facility.facilitySnapshot.guaranteeFeePayableByBank - The guarantee fee payable by the bank.
 * @param {Object} acbsData - The ACBS data containing party identifiers and other details.
 * @param {Object} acbsData.parties - The parties involved in the deal.
 * @param {Object} acbsData.parties.exporter - The exporter party details.
 * @param {string} acbsData.parties.exporter.partyIdentifier - The party identifier of the exporter.
 * @returns {Object} - The mapped facility loan record, including posting date, borrower party identifier, product type ID, product type group, currency, amount, issue date, expiry date, spread rate, next due date, year basis, loan billing frequency type, and additional fields based on the deal type and currency.
 * @throws {Error} - Logs the error and returns an empty object if any error occurs during the mapping process.
 */
const facilityLoan = (deal, facility, acbsData) => {
  try {
    const issueDate = helpers.getIssueDate(facility, getDealSubmissionDate(deal));
    const { guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates;
    const ukefExposure = helpers.getMaximumLiability(facility);
    const currency = facility.facilitySnapshot.currency.id || CONSTANTS.DEAL.CURRENCY.DEFAULT;

    let loanRecord = {
      postingDate: date.now(),
      borrowerPartyIdentifier: acbsData.parties.exporter.partyIdentifier,
      productTypeId: helpers.getProductTypeId(facility),
      productTypeGroup: helpers.getProductTypeGroup(facility, deal.dealSnapshot.dealType),
      currency,
      amount: helpers.getLoanMaximumLiability(ukefExposure, facility, deal.dealSnapshot.dealType),
      issueDate,
      expiryDate: guaranteeExpiryDate,
      spreadRate: facility.facilitySnapshot.guaranteeFee || Number(facility.facilitySnapshot.guaranteeFeePayableByBank),
      nextDueDate: helpers.getNextDueDate(facility),
      yearBasis: helpers.getYearBasis(facility),
      loanBillingFrequencyType: helpers.getFeeType(facility),
    };

    // If facility is not in GBP, then set following fields
    if (facility.tfm.exchangeRate) {
      loanRecord = {
        ...loanRecord,
        dealCustomerUsageRate: helpers.getCurrencyExchangeRate(facility),
        dealCustomerUsageOperationType: CONSTANTS.FACILITY.CURRENCY_EXCHANGE_RATE_OPERATION.DIVIDE,
      };
    }

    // BSS/EWCS deals only fields
    if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.BSS_EWCS) {
      loanRecord = {
        ...loanRecord,
        spreadRateCtl: helpers.getInterestOrFeeRate(facility),
        indexRateChangeFrequency: helpers.getFeeFrequency(facility),
      };
    }

    return loanRecord;
  } catch (error) {
    console.error('Unable to map facility loan record. %o', error);
    return {};
  }
};

module.exports = facilityLoan;
