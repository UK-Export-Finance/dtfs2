
const { getCurrencyById } = require('../helpers/currencies');
const { convertV1Date } = require('../helpers/date-helpers');
const { getUserByEmail } = require('../helpers/users');

const findPortalValue = require('./findPortalValue');
const log = require('../helpers/log');

const mapBondTransactions = (portalDealId, v1Deal) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const mapSingleBond = (bond) => {
    const v1ExtraInfo = {
      originalRequestedCoverStartDate: convertV1Date(bond.Extra_fields.Original_requested_cover_start_date),
      dateThenIssued: convertV1Date(bond.Extra_fields.Date_then_issued),
    };

    if (bond.Extra_fields.User_who_issued && bond.Extra_fields.User_who_issued.username) {
      v1ExtraInfo.userWhoIssued = getUserByEmail(bond.Extra_fields.User_who_issued.username);
    }

    const v2bond = {
      _id: bond.BSS_Guarantee_details.BSS_portal_facility_id,
      ukefFacilityID: [bond.UKEF_BSS_facility_id],
      uniqueIdentificationNumber: bond.BSS_Guarantee_details.BSS_bank_id,
      bondIssuer: bond.BSS_Guarantee_details.BSS_issuer,
      bondType: findPortalValue(bond.BSS_Guarantee_details.BSS_type, 'BSS_type', 'FACILITIES', 'TYPE', logError),
      bondStage: findPortalValue(bond.BSS_Guarantee_details.BSS_stage, 'BSS_stage', 'FACILITIES', 'STAGE_BOND', logError),
      bondBeneficiary: bond.BSS_Guarantee_details.BSS_beneficiary,
      facilityValue: bond.BSS_Financial_details.BSS_value,
      currency: getCurrencyById(bond.BSS_Financial_details.BSS_currency_code),
      conversionRate: bond.BSS_Financial_details.BSS_conversion_rate_deal,
      riskMarginFee: bond.BSS_Financial_details.BSS_fee_rate,
      guaranteeFeePayableByBank: bond.BSS_Financial_details.BSS_fee_perc,
      coveredPercentage: bond.BSS_Financial_details.BSS_guarantee_perc,
      ukefExposure: bond.BSS_Financial_details.BSS_max_liability,
      minimumRiskMarginFee: bond.BSS_Financial_details.BSS_min_quarterly_fee,
      feeType: findPortalValue(bond.BSS_Dates_repayments.BSS_premium_type, 'BSS_premium_type', 'FACILITIES', 'FEE_TYPE', logError),
      feeFrequency: findPortalValue(bond.BSS_Dates_repayments.BSS_premium_freq, 'BSS_premium_freq', 'FACILITIES', 'FEE_FREQUENCY', logError),
      ukefGuaranteeInMonths: bond.BSS_Dates_repayments.BSS_cover_period,
      dayCountBasis: findPortalValue(bond.BSS_Dates_repayments.BSS_day_basis, 'BSS_day_basis', 'FACILITIES', 'DAY_COUNT_BASIS', logError),
      v1ExtraInfo,
    };

    if (bond.BSS_Financial_details.BSS_conversion_date_deal) {
    // Conversion date in format dd-mm-yyyy
      [
        v2bond['conversionRateDate-day'],
        v2bond['conversionRateDate-month'],
        v2bond['conversionRateDate-year'],
      ] = bond.BSS_Financial_details.BSS_conversion_date_deal.split('-');
    }

    if (bond.BSS_Dates_repayments.BSS_cover_start_date) {
      [
        v2bond['requestedCoverStartDate-day'],
        v2bond['requestedCoverStartDate-month'],
        v2bond['requestedCoverStartDate-year'],
      ] = bond.BSS_Dates_repayments.BSS_cover_start_date.split('-');
      v2bond.requestedCoverStartDate = convertV1Date(`${v2bond['requestedCoverStartDate-year']}-${v2bond['requestedCoverStartDate-month']}-${v2bond['requestedCoverStartDate-day']}`);
    }

    if (bond.BSS_Dates_repayments.BSS_issue_date) {
      [
        v2bond['issuedDate-day'],
        v2bond['issuedDate-month'],
        v2bond['issuedDate-year'],
      ] = bond.BSS_Dates_repayments.BSS_issue_date.split('-');
      v2bond.issuedDate = convertV1Date(`${v2bond['issuedDate-year']}-${v2bond['issuedDate-month']}-${v2bond['issuedDate-day']}`);
    }

    if (bond.BSS_Dates_repayments.BSS_cover_end_date) {
      [
        v2bond['coverEndDate-day'],
        v2bond['coverEndDate-month'],
        v2bond['coverEndDate-year'],
      ] = bond.BSS_Dates_repayments.BSS_cover_end_date.split('-');
    }

    return v2bond;
  };


  const { Facilities: { BSS: bond } } = v1Deal;

  let items = [];

  if (bond) {
    if (Array.isArray(bond)) {
      items = bond.map((b) => mapSingleBond(b));
    } else {
      items.push(mapSingleBond(bond));
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


module.exports = mapBondTransactions;
