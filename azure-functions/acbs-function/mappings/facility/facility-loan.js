/*
"portfolioIdentifier":              Facility portfolio idenfifier. Default to "E1"
"postingDate":                      Date of submission to ACBS
"facilityIdentifier":               UKEF facilityId
"borrowerPartyIdentifier":          exporter ACBS ID
"productTypeId":                    Facility Type i.e. 250 for BOND
"productTypeGroup":                 Product group EWCS (EW) , Bond (BS) and GEF (GM)
"currency":                         Facility currency code
"dealCustomerUsageRate":            This is Currency exchange rate (FX rate)
"dealCustomerUsageOperationType":   This is Currency exchange rate operation (D for divide, M for Multiply), set to `D`
"amount":                           ukefExposure
"issueDate":                        At Commitment stage its not required ,
                                    Issued when issued it would be Issue Date for Bond OR Disbursement Date for Loan
"expiryDate":                       Facility expiry date
"spreadRate":                       Used for Premium Accrual Schedule. For GEF, BSS and EWCS.
"spreadRateCTL":                    Used for Contractual Interest Accrual Schedule (CTL).
                                    For EWCS. EWCS needs two spread rates.
"nextDueDate":                      guaranteeCommencementDate + Fee frequency in months
"yearBasis":                        dayCountBasis : 360 = 5, 365 = 1
"indexRateChangeFrequency":         feeFrequency
"loanBillingFrequencyType":         feeType
*/

const helpers = require('./helpers');
const date = require('../../helpers/date');
const CONSTANTS = require('../../constants');
const getDealSubmissionDate = require('../deal/helpers/get-deal-submission-date');

const facilityLoan = (deal, facility, acbsData) => {
  const issueDate = helpers.getIssueDate(facility, getDealSubmissionDate(deal));
  const { guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : facility.update;

  let loanRecord = {
    portfolioIdentifier: CONSTANTS.FACILITY.PORTFOLIO.E1,
    postingDate: date.now(),
    facilityIdentifier: facility.facilitySnapshot.ukefFacilityId.padStart(10, 0),
    borrowerPartyIdentifier: acbsData.parties.exporter.partyIdentifier,
    productTypeId: helpers.getProductTypeId(facility),
    productTypeGroup: helpers.getProductTypeGroup(facility, deal.dealSnapshot.dealType),
    currency: facility.facilitySnapshot.currency.id,
    amount: facility.tfm.ukefExposure || facility.facilitySnapshot.ukefExposure,
    issueDate,
    expiryDate: guaranteeExpiryDate,
    spreadRate: facility.facilitySnapshot.guaranteeFee || Number(facility.facilitySnapshot.guaranteeFeePayableByBank),
    nextDueDate: helpers.getNextDueDate(facility, deal.dealSnapshot.dealType),
    yearBasis: helpers.getYearBasis(facility),
    loanBillingFrequencyType: helpers.getFeeType(facility),
  };

  // If facility is not in GBP, then set following fields
  if (facility.facilitySnapshot.exchangeRate) {
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
      spreadRateCTL: helpers.getInterestOrFeeRate(facility),
      indexRateChangeFrequency: helpers.getFeeFrequency(facility),
    };
  }

  return loanRecord;
};

module.exports = facilityLoan;
