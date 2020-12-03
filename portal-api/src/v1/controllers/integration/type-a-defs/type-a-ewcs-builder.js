const { typeAEWCS, nillableNode } = require('./type-a-template');

const typeAEWCSBuilder = () => {
  const ewcs = JSON.parse(JSON.stringify(typeAEWCS));

  const EWCSBuilder = {
    ewcs,
    UKEF_EWCS_facility_id: (value = '') => {
      ewcs.UKEF_EWCS_facility_id = value;
      return EWCSBuilder;
    },
    EWCS_portal_facility_id: (value = '') => {
      ewcs.EWCS_Guarantee_details.EWCS_portal_facility_id = value;
      return EWCSBuilder;
    },
    EWCS_bank_id: (value = '') => {
      ewcs.EWCS_Guarantee_details.EWCS_bank_id = value;
      return EWCSBuilder;
    },
    EWCS_stage: (value = '') => {
      ewcs.EWCS_Guarantee_details.EWCS_stage = value;
      return EWCSBuilder;
    },
    EWCS_value: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_value = value;
      return EWCSBuilder;
    },
    EWCS_currency_code: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_currency_code = value;
      return EWCSBuilder;
    },
    EWCS_conversion_rate_deal: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_conversion_rate_deal = value;
      return EWCSBuilder;
    },
    EWCS_conversion_date_deal: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_conversion_date_deal = value;
      return EWCSBuilder;
    },
    EWCS_disbursement_amount: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_disbursement_amount = value;
      return EWCSBuilder;
    },
    EWCS_interest_rate: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_interest_rate = value;
      return EWCSBuilder;
    },
    EWCS_fee_perc: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_fee_perc = value;
      return EWCSBuilder;
    },
    EWCS_guarantee_perc: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_guarantee_perc = value;
      return EWCSBuilder;
    },
    EWCS_max_liability: (value = '') => {
      ewcs.EWCS_Financial_details.EWCS_max_liability = value;
      return EWCSBuilder;
    },
    EWCS_min_quarterly_fee: (value) => {
      ewcs.EWCS_Financial_details.EWCS_min_quarterly_fee = value || 0;
      return EWCSBuilder;
    },
    EWCS_premium_freq: (value = nillableNode) => {
      ewcs.EWCS_Dates_repayments.EWCS_premium_freq = value;
      return EWCSBuilder;
    },
    EWCS_premium_type: (value = '') => {
      ewcs.EWCS_Dates_repayments.EWCS_premium_type = value;
      return EWCSBuilder;
    },
    EWCS_cover_start_date: (value = '') => {
      ewcs.EWCS_Dates_repayments.EWCS_cover_start_date = value;
      return EWCSBuilder;
    },
    EWCS_issue_date: (value = '') => {
      ewcs.EWCS_Dates_repayments.EWCS_issue_date = value;
      return EWCSBuilder;
    },
    EWCS_cover_end_date: (value = '') => {
      ewcs.EWCS_Dates_repayments.EWCS_cover_end_date = value;
      return EWCSBuilder;
    },
    EWCS_cover_period: (value = '') => {
      ewcs.EWCS_Dates_repayments.EWCS_cover_period = value;
      return EWCSBuilder;
    },
    EWCS_day_basis: (value = '') => {
      ewcs.EWCS_Dates_repayments.EWCS_day_basis = value;
      return EWCSBuilder;
    },
  };

  return EWCSBuilder;
};

module.exports = typeAEWCSBuilder;
