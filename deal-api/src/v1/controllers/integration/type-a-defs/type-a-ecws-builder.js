const { typeAECWS, nillableNode } = require('./type-a-template');

const typeAECWSBuilder = () => {
  const ecws = JSON.parse(JSON.stringify(typeAECWS));

  const ecwsBuilder = {
    ecws,
    UKEF_ECWS_facility_id: (value = '') => {
      ecws.UKEF_ECWS_facility_id = value;
      return ecwsBuilder;
    },
    ECWS_portal_facility_id: (value = '') => {
      ecws.ECWS_Guarantee_details.ECWS_portal_facility_id = value;
      return ecwsBuilder;
    },
    ECWS_bank_id: (value = '') => {
      ecws.ECWS_Guarantee_details.ECWS_bank_id = value;
      return ecwsBuilder;
    },
    ECWS_stage: (value = '') => {
      ecws.ECWS_Guarantee_details.ECWS_stage = value;
      return ecwsBuilder;
    },
    ECWS_value: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_value = value;
      return ecwsBuilder;
    },
    ECWS_currency_code: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_currency_code = value;
      return ecwsBuilder;
    },
    ECWS_conversion_rate_deal: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_conversion_rate_deal = value;
      return ecwsBuilder;
    },
    ECWS_conversion_date_deal: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_conversion_date_deal = value;
      return ecwsBuilder;
    },
    ECWS_disbursement_amount: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_disbursement_amount = value;
      return ecwsBuilder;
    },
    ECWS_fee_perc: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_fee_perc = value;
      return ecwsBuilder;
    },
    ECWS_guarantee_perc: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_guarantee_perc = value;
      return ecwsBuilder;
    },
    ECWS_max_liability: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_max_liability = value;
      return ecwsBuilder;
    },
    ECWS_min_quarterly_fee: (value = '') => {
      ecws.ECWS_Financial_details.ECWS_min_quarterly_fee = value;
      return ecwsBuilder;
    },
    ECWS_premium_freq: (value = nillableNode) => {
      ecws.ECWS_Dates_repayments.ECWS_premium_freq = value;
      return ecwsBuilder;
    },
    ECWS_premium_type: (value = '') => {
      ecws.ECWS_Dates_repayments.ECWS_premium_type = value;
      return ecwsBuilder;
    },
    ECWS_cover_start_date: (value = '') => {
      ecws.ECWS_Dates_repayments.ECWS_cover_start_date = value;
      return ecwsBuilder;
    },
    ECWS_issue_date: (value = '') => {
      ecws.ECWS_Dates_repayments.ECWS_issue_date = value;
      return ecwsBuilder;
    },
    ECWS_cover_end_date: (value = '') => {
      ecws.ECWS_Dates_repayments.ECWS_cover_end_date = value;
      return ecwsBuilder;
    },
    ECWS_cover_period: (value = '') => {
      ecws.ECWS_Dates_repayments.ECWS_cover_period = value;
      return ecwsBuilder;
    },
    ECWS_day_basis: (value = '') => {
      ecws.ECWS_Dates_repayments.ECWS_day_basis = value;
      return ecwsBuilder;
    },
  };

  return ecwsBuilder;
};

module.exports = typeAECWSBuilder;
