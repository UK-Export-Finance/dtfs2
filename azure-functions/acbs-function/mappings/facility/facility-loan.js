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
