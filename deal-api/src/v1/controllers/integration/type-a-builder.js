const fs = require('fs');
const path = require('path');

const template = fs.readFileSync(path.join(__dirname, 'type-a-template.xml'), 'utf-8');

const newTemplate = () => `${template}`;

const OPEN = '${';
const CLOSE = '}';

module.exports = () => {
  const obj = {};

  const builder = {
    portal_deal_id: (value) => {
      obj.portal_deal_id = value;
      return builder;
    },
    Deal_name: (value) => {
      obj.Deal_name = value;
      return builder;
    },
    Bank_deal_id: (value) => {
      obj.Bank_deal_id = value;
      return builder;
    },
    Application_route: (value) => {
      obj.Application_route = value;
      return builder;
    },
    Application_owner: (value) => {
      obj.Application_owner = value;
      return builder;
    },
    Application_owner_email: (value) => {
      obj.Application_owner_email = value;
      return builder;
    },
    Application_bank: (value) => {
      obj.Application_bank = value;
      return builder;
    },
    Application_bank_co_hse_reg_number: (value) => {
      obj.Application_bank_co_hse_reg_number = value;
      return builder;
    },
    Customer_type: (value) => {
      obj.Customer_type = value;
      return builder;
    },
    Exporter_co_hse_reg_number: (value) => {
      obj.Exporter_co_hse_reg_number = value;
      return builder;
    },
    Exporter_registration_source: (value) => {
      obj.Exporter_registration_source = value;
      return builder;
    },
    Exporter_name: (value) => {
      obj.Exporter_name = value;
      return builder;
    },
    Exporter_address_Line1: (value) => {
      obj.Exporter_address_Line1 = value;
      return builder;
    },
    Exporter_address_Line2: (value) => {
      obj.Exporter_address_Line2 = value;
      return builder;
    },
    Exporter_address_Line3: (value) => {
      obj.Exporter_address_Line3 = value;
      return builder;
    },
    Exporter_address_Town: (value) => {
      obj.Exporter_address_Town = value;
      return builder;
    },
    Exporter_address_PostalCode: (value) => {
      obj.Exporter_address_PostalCode = value;
      return builder;
    },
    Exporter_address_Country: (value) => {
      obj.Exporter_address_Country = value;
      return builder;
    },
    Exporter_correspondence_address_Line1: (value) => {
      obj.Exporter_correspondence_address_Line1 = value;
      return builder;
    },
    Exporter_correspondence_address_Line2: (value) => {
      obj.Exporter_correspondence_address_Line2 = value;
      return builder;
    },
    Exporter_correspondence_address_Line3: (value) => {
      obj.Exporter_correspondence_address_Line3 = value;
      return builder;
    },
    Exporter_correspondence_address_Town: (value) => {
      obj.Exporter_correspondence_address_Town = value;
      return builder;
    },
    Exporter_correspondence_address_PostalCode: (value) => {
      obj.Exporter_correspondence_address_PostalCode = value;
      return builder;
    },
    Exporter_correspondence_address_Country: (value) => {
      obj.Exporter_correspondence_address_Country = value;
      return builder;
    },
    Industry_sector_code: (value) => {
      obj.Industry_sector_code = value;
      return builder;
    },
    Industry_sector_name: (value) => {
      obj.Industry_sector_name = value;
      return builder;
    },
    Industry_class_code: (value) => {
      obj.Industry_class_code = value;
      return builder;
    },
    Industry_class_name: (value) => {
      obj.Industry_class_name = value;
      return builder;
    },
    Sme_type: (value) => {
      obj.Sme_type = value;
      return builder;
    },
    Description_of_export: (value) => {
      obj.Description_of_export = value;
      return builder;
    },
    Buyer_name: (value) => {
      obj.Buyer_name = value;
      return builder;
    },
    Buyer_country_code: (value) => {
      obj.Buyer_country_code = value;
      return builder;
    },
    Destination_country_code: (value) => {
      obj.Destination_country_code = value;
      return builder;
    },
    Deal_currency_code: (value) => {
      obj.Deal_currency_code = value;
      return builder;
    },
    Conversion_rate: (value) => {
      obj.Conversion_rate = value;
      return builder;
    },
    Conversion_date: (value) => {
      obj.Conversion_date = value;
      return builder;
    },
    Contract_value: (value) => {
      obj.Contract_value = value;
      return builder;
    },


    Ec_agents_check: (value) => {
      obj.Ec_agents_check = value;
      return builder;
    },
    Ec_initial_term_check: (value) => {
      obj.Ec_initial_term_check = value;
      return builder;
    },
    Ec_total_exposure_check: (value) => {
      obj.Ec_total_exposure_check = value;
      return builder;
    },
    Ec_bond_issuance_check: (value) => {
      obj.Ec_bond_issuance_check = value;
      return builder;
    },
    Ec_industry_check: (value) => {
      obj.Ec_industry_check = value;
      return builder;
    },

    Ec_indemnifier_turnover_check: (value) => {
      obj.Ec_indemnifier_turnover_check = value;
      return builder;
    },
    Ec_indemnifier_net_worth_check: (value) => {
      obj.Ec_indemnifier_net_worth_check = value;
      return builder;
    },
    Ec_indemnifier_liquidity_check: (value) => {
      obj.Ec_indemnifier_liquidity_check = value;
      return builder;
    },
    Ec_indemnifier_filed_accounts_check: (value) => {
      obj.Ec_indemnifier_filed_accounts_check = value;
      return builder;
    },
    Ec_indemnifier_watchlist_check: (value) => {
      obj.Ec_indemnifier_watchlist_check = value;
      return builder;
    },

    Ec_indemnifier_rating_check: (value) => {
      obj.Ec_indemnifier_rating_check = value;
      return builder;
    },
    Ec_internal_approval_check: (value) => {
      obj.Ec_internal_approval_check = value;
      return builder;
    },
    Ec_third_party_check: (value) => {
      obj.Ec_third_party_check = value;
      return builder;
    },
    Ec_bank_facility_letter_check: (value) => {
      obj.Ec_bank_facility_letter_check = value;
      return builder;
    },
    Ec_banks_normal_pricing_policies_check: (value) => {
      obj.Ec_banks_normal_pricing_policies_check = value;
      return builder;
    },

    Ec_fees_interest_frequency_check: (value) => {
      obj.Ec_fees_interest_frequency_check = value;
      return builder;
    },
    Ec_affiliate_to_the_supplier_check: (value) => {
      obj.Ec_affiliate_to_the_supplier_check = value;
      return builder;
    },
    Ec_requested_cover_start_date_check: (value) => {
      obj.Ec_requested_cover_start_date_check = value;
      return builder;
    },
    Ec_supplier_declaration_check: (value) => {
      obj.Ec_supplier_declaration_check = value;
      return builder;
    },
    Ec_affected_transaction_check: (value) => {
      obj.Ec_affected_transaction_check = value;
      return builder;
    },


    Ec_bank_complied_check: (value) => {
      obj.Ec_bank_complied_check = value;
      return builder;
    },
    Ec_bank_sole_beneficial_owner_check: (value) => {
      obj.Ec_bank_sole_beneficial_owner_check = value;
      return builder;
    },
    Ec_disposal_risk_transfer_check: (value) => {
      obj.Ec_disposal_risk_transfer_check = value;
      return builder;
    },
    Ec_consent_obligor_check: (value) => {
      obj.Ec_consent_obligor_check = value;
      return builder;
    },
    Ec_agreement_with_obligor_check: (value) => {
      obj.Ec_agreement_with_obligor_check = value;
      return builder;
    },

    BSS_portal_facility_id: (value) => {
      obj.BSS_portal_facility_id = value;
      return builder;
    },
    BSS_issuer: (value) => {
      obj.BSS_issuer = value;
      return builder;
    },
    BSS_type: (value) => {
      obj.BSS_type = value;
      return builder;
    },
    BSS_stage: (value) => {
      obj.BSS_stage = value;
      return builder;
    },
    BSS_beneficiary: (value) => {
      obj.BSS_beneficiary = value;
      return builder;
    },

    BSS_Financial_details_BSS_value: (value) => {
      obj.BSS_Financial_details_BSS_value = value;
      return builder;
    },
    BSS_Financial_details_BSS_currency_code: (value) => {
      obj.BSS_Financial_details_BSS_currency_code = value;
      return builder;
    },
    BSS_Financial_details_BSS_conversion_rate_deal: (value) => {
      obj.BSS_Financial_details_BSS_conversion_rate_deal = value;
      return builder;
    },
    BSS_Financial_details_BSS_conversion_date_deal: (value) => {
      obj.BSS_Financial_details_BSS_conversion_date_deal = value;
      return builder;
    },
    BSS_Financial_details_BSS_fee_rate: (value) => {
      obj.BSS_Financial_details_BSS_fee_rate = value;
      return builder;
    },
    BSS_Financial_details_BSS_fee_perc: (value) => {
      obj.BSS_Financial_details_BSS_fee_perc = value;
      return builder;
    },
    BSS_Financial_details_BSS_guarantee_perc: (value) => {
      obj.BSS_Financial_details_BSS_guarantee_perc = value;
      return builder;
    },
    BSS_Financial_details_BSS_max_liability: (value) => {
      obj.BSS_Financial_details_BSS_max_liability = value;
      return builder;
    },
    BSS_Financial_details_BSS_min_quarterly_fee: (value) => {
      obj.BSS_Financial_details_BSS_min_quarterly_fee = value;
      return builder;
    },

    BSS_Dates_repayments_BSS_premium_freq: (value) => {
      obj.BSS_Dates_repayments_BSS_premium_freq = value;
      return builder;
    },
    BSS_Dates_repayments_BSS_premium_type: (value) => {
      obj.BSS_Dates_repayments_BSS_premium_type = value;
      return builder;
    },
    BSS_Dates_repayments_BSS_cover_start_date: (value) => {
      obj.BSS_Dates_repayments_BSS_cover_start_date = value;
      return builder;
    },
    BSS_Dates_repayments_BSS_issue_date: (value) => {
      obj.BSS_Dates_repayments_BSS_issue_date = value;
      return builder;
    },
    BSS_Dates_repayments_BSS_cover_end_date: (value) => {
      obj.BSS_Dates_repayments_BSS_cover_end_date = value;
      return builder;
    },
    BSS_Dates_repayments_BSS_cover_period: (value) => {
      obj.BSS_Dates_repayments_BSS_cover_period = value;
      return builder;
    },
    BSS_Dates_repayments_BSS_day_basis: (value) => {
      obj.BSS_Dates_repayments_BSS_day_basis = value;
      return builder;
    },

    UKEF_EWCS_facility_id: (value) => {
      obj.UKEF_EWCS_facility_id = value;
      return builder;
    },
    EWCS_portal_facility_id: (value) => {
      obj.EWCS_portal_facility_id = value;
      return builder;
    },
    EWCS_bank_id: (value) => {
      obj.EWCS_bank_id = value;
      return builder;
    },
    EWCS_stage: (value) => {
      obj.EWCS_stage = value;
      return builder;
    },

    EWCS_value: (value) => {
      obj.EWCS_value = value;
      return builder;
    },
    EWCS_currency_code: (value) => {
      obj.EWCS_currency_code = value;
      return builder;
    },
    EWCS_conversion_rate_deal: (value) => {
      obj.EWCS_conversion_rate_deal = value;
      return builder;
    },
    EWCS_conversion_date_deal: (value) => {
      obj.EWCS_conversion_date_deal = value;
      return builder;
    },

    EWCS_disbursement_amount: (value) => {
      obj.EWCS_disbursement_amount = value;
      return builder;
    },
    EWCS_interest_rate: (value) => {
      obj.EWCS_interest_rate = value;
      return builder;
    },
    EWCS_fee_perc: (value) => {
      obj.EWCS_fee_perc = value;
      return builder;
    },
    EWCS_guarantee_perc: (value) => {
      obj.EWCS_guarantee_perc = value;
      return builder;
    },
    EWCS_max_liability: (value) => {
      obj.EWCS_max_liability = value;
      return builder;
    },
    EWCS_min_quarterly_fee: (value) => {
      obj.EWCS_min_quarterly_fee = value;
      return builder;
    },

    EWCS_premium_type: (value) => {
      obj.EWCS_premium_type = value;
      return builder;
    },
    EWCS_premium_freq: (value) => {
      obj.EWCS_premium_freq = value;
      return builder;
    },
    EWCS_cover_start_date: (value) => {
      obj.EWCS_cover_start_date = value;
      return builder;
    },
    EWCS_issue_date: (value) => {
      obj.EWCS_issue_date = value;
      return builder;
    },
    EWCS_cover_end_date: (value) => {
      obj.EWCS_cover_end_date = value;
      return builder;
    },
    EWCS_cover_period: (value) => {
      obj.EWCS_cover_period = value;
      return builder;
    },
    EWCS_day_basis: (value) => {
      obj.EWCS_day_basis = value;
      return builder;
    },

    Deal_no_facilities: (value) => {
      obj.Deal_no_facilities = value;
      return builder;
    },
    Deal_total_value_deal_cur: (value) => {
      obj.Deal_total_value_deal_cur = value;
      return builder;
    },
    Deal_total_exposure_gbp: (value) => {
      obj.Deal_total_exposure_gbp = value;
      return builder;
    },
    Deal_total_premium_gbp: (value) => {
      obj.Deal_total_premium_gbp = value;
      return builder;
    },


    Deal_total_exposure_deal_cur: (value) => {
      obj.Deal_total_exposure_deal_cur = value;
      return builder;
    },
    Deal_total_premium_deal_cur: (value) => {
      obj.Deal_total_premium_deal_cur = value;
      return builder;
    },
    BSS_no_facilities: (value) => {
      obj.BSS_no_facilities = value;
      return builder;
    },
    BSS_total_exposure_gbp: (value) => {
      obj.BSS_total_exposure_gbp = value;
      return builder;
    },

    BSS_total_premium_gbp: (value) => {
      obj.BSS_total_premium_gbp = value;
      return builder;
    },
    BSS_total_exposure_deal_cur: (value) => {
      obj.BSS_total_exposure_deal_cur = value;
      return builder;
    },
    BSS_total_premium_deal_cur: (value) => {
      obj.BSS_total_premium_deal_cur = value;
      return builder;
    },
    EWCS_no_facilities: (value) => {
      obj.EWCS_no_facilities = value;
      return builder;
    },

    EWCS_total_exposure_gbp: (value) => {
      obj.EWCS_total_exposure_gbp = value;
      return builder;
    },
    EWCS_total_premium_gbp: (value) => {
      obj.EWCS_total_premium_gbp = value;
      return builder;
    },
    EWCS_total_exposure_deal_cur: (value) => {
      obj.EWCS_total_exposure_deal_cur = value;
      return builder;
    },
    EWCS_total_premium_deal_cur: (value) => {
      obj.EWCS_total_premium_deal_cur = value;
      return builder;
    },

    build: () => {
      let typeA = newTemplate();

      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i += 1) {
        typeA = typeA.replace(`${OPEN}${keys[i]}${CLOSE}`, obj[keys[i]]);
      }

      return typeA;
    },

  };

  return builder;
};
