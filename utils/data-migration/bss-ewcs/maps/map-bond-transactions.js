const { getCurrencyById } = require('../helpers/currencies');
const { convertV1Date } = require('../helpers/date-helpers');
const { getBssUserByEmail } = require('../../helpers/users');
const formatUkefId = require('../helpers/formatUkefId');

const findPortalValue = require('./findPortalValue');
const CONSTANTS = require('../../../../portal-api/src/constants');

const log = require('../../helpers/logs');

const mapBondTransactions = (portalDealId, v1Deal) => {
  let hasError = false;

  const logError = (error) => {
    hasError = true;
    log.addError(portalDealId, error);
  };

  const mapSingleBond = (bond) => {
    const v1ExtraInfo = {
      originalRequestedCoverStartDate: convertV1Date(bond.Extra_fields.Original_requested_cover_start_date),
    };

    const facilityStage = findPortalValue(bond.BSS_Guarantee_details.BSS_stage, 'BSS_stage', 'FACILITIES', 'STAGE_BOND', logError);
    const hasBeenIssued = facilityStage === 'Issued';

    const v2bond = {
      type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      ukefFacilityId: formatUkefId(bond.UKEF_BSS_facility_id),
      name: bond.BSS_Guarantee_details.BSS_bank_id,
      bondIssuer: bond.BSS_Guarantee_details.BSS_issuer,
      bondType: findPortalValue(bond.BSS_Guarantee_details.BSS_type, 'BSS_type', 'FACILITIES', 'TYPE', logError),
      facilityStage,
      hasBeenIssued,
      bondBeneficiary: bond.BSS_Guarantee_details.BSS_beneficiary,
      value: bond.BSS_Financial_details.BSS_value,
      currency: getCurrencyById(bond.BSS_Financial_details.BSS_currency_code),
      currencySameAsSupplyContractCurrency: (bond.BSS_Financial_details.BSS_currency_code === v1Deal.Deal_information.Financial.Deal_currency_code).toString(),
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

    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED) {
      v2bond.status = CONSTANTS.FACILITIES.DEAL_STATUS.NOT_STARTED;
    }

    if (bond.BSS_Financial_details.BSS_conversion_date_deal) {
    // Conversion date in format dd-mm-yyyy
      [
        v2bond['conversionRateDate-day'],
        v2bond['conversionRateDate-month'],
        v2bond['conversionRateDate-year'],
      ] = bond.BSS_Financial_details.BSS_conversion_date_deal.split('-');
    }

    if (bond.BSS_Dates_repayments.BSS_issue_date) {
      [
        v2bond['issuedDate-day'],
        v2bond['issuedDate-month'],
        v2bond['issuedDate-year'],
      ] = bond.BSS_Dates_repayments.BSS_issue_date.split('-');
      v2bond.issuedDate = convertV1Date(`${v2bond['issuedDate-year']}-${v2bond['issuedDate-month']}-${v2bond['issuedDate-day']}`);
    }

    if (facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED) {
      if (bond.BSS_Dates_repayments.BSS_cover_start_date) {
        [
          v2bond['requestedCoverStartDate-day'],
          v2bond['requestedCoverStartDate-month'],
          v2bond['requestedCoverStartDate-year'],
        ] = bond.BSS_Dates_repayments.BSS_cover_start_date.split('-');
        v2bond.requestedCoverStartDate = convertV1Date(`${v2bond['requestedCoverStartDate-year']}-${v2bond['requestedCoverStartDate-month']}-${v2bond['requestedCoverStartDate-day']}`);
      }

      if (bond.BSS_Dates_repayments.BSS_cover_end_date) {
        [
          v2bond['coverEndDate-day'],
          v2bond['coverEndDate-month'],
          v2bond['coverEndDate-year'],
        ] = bond.BSS_Dates_repayments.BSS_cover_end_date.split('-');
      }
    }

    if (bond.Extra_fields.Date_then_issued) {
      v2bond.submittedAsIssuedDate = convertV1Date(bond.Extra_fields.Date_then_issued);
      v2bond.issueFacilityDetailsSubmitted = true;
    }

    if (bond.Extra_fields.User_who_issued && bond.Extra_fields.User_who_issued.username) {
      v2bond.submittedAsIssuedBy = getBssUserByEmail(bond.Extra_fields.User_who_issued.username);
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

module.exports = mapBondTransactions;
