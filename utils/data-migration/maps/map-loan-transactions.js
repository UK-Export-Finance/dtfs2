
const { getCurrencyById } = require('../helpers/currencies');
const { convertV1Date } = require('../helpers/date-helpers');

const findPortalValue = require('./findPortalValue');
const log = require('../helpers/log');

const mapLoanTransactions = (portalDealId, v1Deal) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const mapSingleLoan = (loan) => {
    const v2loan = {
      _id: loan.BSS_Guarantee_details.BSS_portal_facility_id,
      ukefFacilityID: [loan.UKEF_BSS_facility_id],
      uniqueIdentificationNumber: loan.BSS_Guarantee_details.BSS_bank_id,
      loanIssuer: loan.BSS_Guarantee_details.BSS_issuer,
      loanType: findPortalValue(loan.BSS_Guarantee_details.BSS_type, 'BSS_type', 'FACILITIES', 'TYPE', logError),
      loanStage: findPortalValue(loan.BSS_Guarantee_details.BSS_stage, 'BSS_stage', 'FACILITIES', 'BOND_STAGE', logError),
      loanBeneficiary: loan.BSS_Guarantee_details.BSS_beneficiary,
      facilityValue: loan.BSS_Financial_details.BSS_value,
      currency: getCurrencyById(loan.BSS_Financial_details.BSS_currency_code),
      conversionRate: loan.BSS_Financial_details.BSS_conversion_rate_deal,
      riskMarginFee: loan.BSS_Financial_details.BSS_fee_rate,
      guaranteeFeePayableByBank: loan.BSS_Financial_details.BSS_fee_perc,
      coveredPercentage: loan.BSS_Financial_details.BSS_guarantee_perc,
      ukefExposure: loan.BSS_Financial_details.BSS_max_liability,
      minimumRiskMarginFee: loan.BSS_Financial_details.BSS_min_quarterly_fee,
      feeType: findPortalValue(loan.BSS_Dates_repayments.BSS_premium_type, 'BSS_premium_type', 'FACILITIES', 'FEE_TYPE', logError),
      feeFrequency: findPortalValue(loan.BSS_Dates_repayments.BSS_premium_freq, 'BSS_premium_freq', 'FACILITIES', 'FEE_FREQUENCY', logError),
      ukefGuaranteeInMonths: loan.BSS_Dates_repayments.BSS_cover_period,
      dayCountBasis: findPortalValue(loan.BSS_Dates_repayments.BSS_day_basis, 'BSS_day_basis', 'FACILITIES', 'DAY_COUNT_BASIS', logError),

    };

    if (loan.BSS_Financial_details.BSS_conversion_date_deal) {
    // Conversion date in format dd-mm-yyyy
      [
        v2loan['conversionRateDate-day'],
        v2loan['conversionRateDate-month'],
        v2loan['conversionRateDate-year'],
      ] = loan.BSS_Financial_details.BSS_conversion_date_deal.split('-');
    }

    if (loan.BSS_Dates_repayments.BSS_cover_start_date) {
      [
        v2loan['requestedCoverStartDate-day'],
        v2loan['requestedCoverStartDate-month'],
        v2loan['requestedCoverStartDate-year'],
      ] = loan.BSS_Dates_repayments.BSS_cover_start_date.split('-');
      v2loan.requestedCoverStartDate = convertV1Date(`${v2loan['requestedCoverStartDate-year']}-${v2loan['requestedCoverStartDate-month']}-${v2loan['requestedCoverStartDate-day']}`);
    }

    if (loan.BSS_Dates_repayments.BSS_issue_date) {
      [
        v2loan['issuedDate-day'],
        v2loan['issuedDate-month'],
        v2loan['issuedDate-year'],
      ] = loan.BSS_Dates_repayments.BSS_issue_date.split('-');
      v2loan.issuedDate = convertV1Date(`${v2loan['issuedDate-year']}-${v2loan['issuedDate-month']}-${v2loan['issuedDate-day']}`);
    }

    if (loan.BSS_Dates_repayments.BSS_cover_end_date) {
      [
        v2loan['coverEndDate-day'],
        v2loan['coverEndDate-month'],
        v2loan['coverEndDate-year'],
      ] = loan.BSS_Dates_repayments.BSS_cover_end_date.split('-');
    }

    return v2loan;
  };


  const { Facilities: { BSS: loan } } = v1Deal;

  let items = [];

  if (loan) {
    if (Array.isArray(loan)) {
      items = loan.map((b) => mapSingleLoan(b));
    } else {
      items.push(mapSingleLoan(loan));
    }
  }

  return [
    { items },
    hasError,
  ];
};
/*

    submissionType: 'Manual Inclusion Application',

  }
  */


module.exports = mapLoanTransactions;
