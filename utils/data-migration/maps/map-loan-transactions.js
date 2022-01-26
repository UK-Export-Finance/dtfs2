
const { getCurrencyById, formatCurrency } = require('../helpers/currencies');
const { convertV1Date } = require('../helpers/date-helpers');
const { getUserByEmail } = require('../helpers/users');
const formatUkefId = require('../helpers/formatUkefId');

const findPortalValue = require('./findPortalValue');
const CONSTANTS = require('../../../portal-api/src/constants');

const log = require('../helpers/log');

const mapLoanTransactions = (portalDealId, v1Deal) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const mapSingleLoan = (loan) => {
    const v1ExtraInfo = {
      originalRequestedCoverStartDate: convertV1Date(loan.Extra_fields.Original_requested_cover_start_date),
    };

    const facilityStage = findPortalValue(loan.EWCS_Guarantee_details.EWCS_stage, 'EWCS_stage', 'FACILITIES', 'STAGE_LOAN', logError);

    const v2loan = {
      _id: loan.EWCS_Guarantee_details.EWCS_portal_facility_id,
      ukefFacilityId: formatUkefId(loan.UKEF_EWCS_facility_id),
      name: loan.EWCS_Guarantee_details.EWCS_bank_id,
      facilityStage,
      value: loan.EWCS_Financial_details.EWCS_value,
      currency: getCurrencyById(loan.EWCS_Financial_details.EWCS_currency_code),
      currencySameAsSupplyContractCurrency: (loan.EWCS_Financial_details.EWCS_currency_code === v1Deal.Deal_information.Financial.Deal_currency_code).toString(),
      conversionRate: loan.EWCS_Financial_details.EWCS_conversion_rate_deal,
      disbursementAmount: formatCurrency(loan.EWCS_Financial_details.EWCS_disbursement_amount),
      interestMarginFee: loan.EWCS_Financial_details.EWCS_interest_rate,
      guaranteeFeePayableByBank: loan.EWCS_Financial_details.EWCS_fee_perc,
      coveredPercentage: loan.EWCS_Financial_details.EWCS_guarantee_perc,
      ukefExposure: loan.EWCS_Financial_details.EWCS_max_liability,
      minimumQuarterlyFee: loan.EWCS_Financial_details.EWCS_min_quarterly_fee,
      premiumType: findPortalValue(loan.EWCS_Dates_repayments.EWCS_premium_type, 'EWCS_premium_type', 'FACILITIES', 'FEE_TYPE', logError),
      premiumFrequency: findPortalValue(loan.EWCS_Dates_repayments.EWCS_premium_freq, 'EWCS_premium_freq', 'FACILITIES', 'FEE_FREQUENCY', logError),
      ukefGuaranteeInMonths: loan.EWCS_Dates_repayments.EWCS_cover_period,
      dayCountBasis: findPortalValue(loan.EWCS_Dates_repayments.EWCS_day_basis, 'EWCS_day_basis', 'FACILITIES', 'DAY_COUNT_BASIS', logError),
      v1ExtraInfo,
    };

    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL) {
      v2loan.status = CONSTANTS.FACILITIES.STATUS.NOT_STARTED;
    }

    if (loan.EWCS_Financial_details.EWCS_conversion_date_deal) {
    // Conversion date in format dd-mm-yyyy
      [
        v2loan['conversionRateDate-day'],
        v2loan['conversionRateDate-month'],
        v2loan['conversionRateDate-year'],
      ] = loan.EWCS_Financial_details.EWCS_conversion_date_deal.split('-');
    }

    if (loan.EWCS_Dates_repayments.EWCS_issue_date) {
      [
        v2loan['issuedDate-day'],
        v2loan['issuedDate-month'],
        v2loan['issuedDate-year'],
      ] = loan.EWCS_Dates_repayments.EWCS_issue_date.split('-');
      v2loan.issuedDate = convertV1Date(`${v2loan['issuedDate-year']}-${v2loan['issuedDate-month']}-${v2loan['issuedDate-day']}`);
    }

    if (facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL) {
      if (loan.EWCS_Dates_repayments.EWCS_cover_start_date) {
        [
          v2loan['requestedCoverStartDate-day'],
          v2loan['requestedCoverStartDate-month'],
          v2loan['requestedCoverStartDate-year'],
        ] = loan.EWCS_Dates_repayments.EWCS_cover_start_date.split('-');
        v2loan.requestedCoverStartDate = convertV1Date(`${v2loan['requestedCoverStartDate-year']}-${v2loan['requestedCoverStartDate-month']}-${v2loan['requestedCoverStartDate-day']}`);
      }

      if (loan.EWCS_Dates_repayments.EWCS_cover_end_date) {
        [
          v2loan['coverEndDate-day'],
          v2loan['coverEndDate-month'],
          v2loan['coverEndDate-year'],
        ] = loan.EWCS_Dates_repayments.EWCS_cover_end_date.split('-');
      }
    }

    if (loan.Extra_fields.Date_then_issued) {
      v2loan.submittedAsIssuedDate = convertV1Date(loan.Extra_fields.Date_then_issued);
      v2loan.issueFacilityDetailsSubmitted = true;
    }

    if (loan.Extra_fields.User_who_issued && loan.Extra_fields.User_who_issued.username) {
      v2loan.submittedAsIssuedBy = getUserByEmail(loan.Extra_fields.User_who_issued.username);
    }

    return v2loan;
  };


  const { Facilities: { EWCS: loan } } = v1Deal;

  let items = [];

  if (loan) {
    if (Array.isArray(loan)) {
      items = loan.map((l) => mapSingleLoan(l));
    } else {
      items.push(mapSingleLoan(loan));
    }
  }

  return [
    { items },
    hasError,
  ];
};

module.exports = mapLoanTransactions;
