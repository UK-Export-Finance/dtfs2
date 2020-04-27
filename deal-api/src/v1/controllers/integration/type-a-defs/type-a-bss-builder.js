const { typeABSS, nillableNode } = require('./type-a-template');

const typeABSSBuilder = () => {
  const bss = JSON.parse(JSON.stringify(typeABSS));

  const bssBuilder = {
    bss,
    UKEF_BSS_facility_id: (value = '') => {
      bss.UKEF_BSS_facility_id = value;
      return bssBuilder;
    },
    BSS_portal_facility_id: (value = '') => {
      bss.BSS_Guarantee_details.BSS_portal_facility_id = value;
      return bssBuilder;
    },
    BSS_bank_id: (value = '') => {
      bss.BSS_Guarantee_details.BSS_bank_id = value;
      return bssBuilder;
    },
    BSS_issuer: (value = '') => {
      bss.BSS_Guarantee_details.BSS_issuer = value;
      return bssBuilder;
    },
    BSS_type: (value = '') => {
      bss.BSS_Guarantee_details.BSS_type = value;
      return bssBuilder;
    },
    BSS_stage: (value = '') => {
      bss.BSS_Guarantee_details.BSS_stage = value;
      return bssBuilder;
    },
    BSS_beneficiary: (value = '') => {
      bss.BSS_Guarantee_details.BSS_beneficiary = value;
      return bssBuilder;
    },
    BSS_value: (value = '') => {
      bss.BSS_Financial_details.BSS_value = value;
      return bssBuilder;
    },
    BSS_currency_code: (value = '') => {
      bss.BSS_Financial_details.BSS_currency_code = value;
      return bssBuilder;
    },
    BSS_conversion_rate_deal: (value = '') => {
      bss.BSS_Financial_details.BSS_conversion_rate_deal = value;
      return bssBuilder;
    },
    BSS_conversion_date_deal: (value = '') => {
      bss.BSS_Financial_details.BSS_conversion_date_deal = value;
      return bssBuilder;
    },
    BSS_fee_rate: (value = '') => {
      bss.BSS_Financial_details.BSS_fee_rate = value;
      return bssBuilder;
    },
    BSS_fee_perc: (value = '') => {
      bss.BSS_Financial_details.BSS_fee_perc = value;
      return bssBuilder;
    },
    BSS_guarantee_perc: (value = '') => {
      bss.BSS_Financial_details.BSS_guarantee_perc = value;
      return bssBuilder;
    },
    BSS_max_liability: (value = '') => {
      bss.BSS_Financial_details.BSS_max_liability = value;
      return bssBuilder;
    },
    BSS_min_quarterly_fee: (value = '') => {
      bss.BSS_Financial_details.BSS_min_quarterly_fee = value;
      return bssBuilder;
    },
    BSS_premium_freq: (value = nillableNode) => {
      bss.BSS_Dates_repayments.BSS_premium_freq = value;
      return bssBuilder;
    },
    BSS_premium_type: (value = '') => {
      bss.BSS_Dates_repayments.BSS_premium_type = value;
      return bssBuilder;
    },
    BSS_cover_start_date: (value = '') => {
      bss.BSS_Dates_repayments.BSS_cover_start_date = value;
      return bssBuilder;
    },
    BSS_issue_date: (value = '') => {
      bss.BSS_Dates_repayments.BSS_issue_date = value;
      return bssBuilder;
    },
    BSS_cover_end_date: (value = '') => {
      bss.BSS_Dates_repayments.BSS_cover_end_date = value;
      return bssBuilder;
    },
    BSS_cover_period: (value = '') => {
      bss.BSS_Dates_repayments.BSS_cover_period = value;
      return bssBuilder;
    },
    BSS_day_basis: (value = '') => {
      bss.BSS_Dates_repayments.BSS_day_basis = value;
      return bssBuilder;
    },
  };

  return bssBuilder;
};

module.exports = typeABSSBuilder;
