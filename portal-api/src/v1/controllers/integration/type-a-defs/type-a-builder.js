// NOTE: Workflow integration has been disabled and replaced with TFM integration.
// Leaving this code here just incase we need to re-enable.

// const js2xmlparser = require('js2xmlparser');
const js2xmlparser = { parse: () => {} };

const typeABSSBuilder = require('./type-a-bss-builder');
const typeAEWCSBuilder = require('./type-a-ewcs-builder');

const { typeADeal, nillableNode } = require('./type-a-template');

const { whitespaceCollapse } = require('../helpers');

// Contains details of fields that fail the validation according to what was specifie in type_a.xsd
const validationErrors = [];

module.exports = () => {
  const deal = JSON.parse(JSON.stringify(typeADeal));

  const builder = {
    source: (value = '') => {
      deal['@'].source = value;
      return builder;
    },
    action_code: (value = '') => {
      deal['@'].action_code = value;
      return builder;
    },
    action_name: (value = '') => {
      deal['@'].action_name = value;
      return builder;
    },
    application_group: (value = '') => {
      deal['@'].application_group = value;
      return builder;
    },
    message_type: (value = '') => {
      deal['@'].message_type = value;
      return builder;
    },
    portal_deal_id: (value = '') => {
      deal['@'].portal_deal_id = value;
      return builder;
    },
    revision_id: (value = '') => {
      deal['@'].revision_id = value;
      return builder;
    },
    Deal_name: (value = '') => {
      deal.General_information.Deal_name = value;
      return builder;
    },
    Bank_deal_id: (value = '') => {
      deal.General_information.Bank_deal_id = value;
      return builder;
    },
    Application_route: (eligibility) => {
    /*
      ** From Drupal codebase-
      Current Business logic:
      If all questions are answered as “Yes”, field_is_atp__eligibility = FALSE
      If at least 1 question is answered as “No”, field_is_atp__eligibility = TRUE
      */
      const { criteria } = eligibility;
      deal.Application_route = criteria && criteria.every((c) => c.answer) ? 'Non-ATP' : 'ATP';
      return builder;
    },
    Application_owner: (value = '') => {
      deal.Application_owner = value;
      return builder;
    },
    Application_owner_email: (value = '') => {
      deal.Application_owner_email = value;
      return builder;
    },
    Application_bank: (value = '') => {
      deal.Application_bank = value;
      return builder;
    },
    Application_bank_co_hse_reg_number: (value = '') => {
      deal.Application_bank_co_hse_reg_number = value;
      return builder;
    },
    UKEF_deal_id: (value = '') => {
      deal.UKEF_deal_id = value;
      return builder;
    },
    Customer_type: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Customer_type = value;
      return builder;
    },
    Exporter_co_hse_reg_number: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_co_hse_reg_number = value;
      return builder;
    },
    Exporter_registration_source: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_registration_source = value;
      return builder;
    },
    Exporter_name: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_name = value;
      return builder;
    },
    Exporter_address_Line1: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_address.Line1 = value;
      return builder;
    },
    Exporter_address_Line2: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_address.Line2 = value;
      return builder;
    },
    Exporter_address_Line3: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_address.Line3 = value;
      return builder;
    },
    Exporter_address_Town: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_address.Town = value;
      return builder;
    },
    Exporter_address_PostalCode: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_address.PostalCode = value;
      return builder;
    },
    Exporter_address_Country: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_address.Country = value;
      return builder;
    },
    Exporter_correspondence_address_Line1: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_correspondence_address.Line1 = value;
      return builder;
    },
    Exporter_correspondence_address_Line2: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_correspondence_address.Line2 = value;
      return builder;
    },
    Exporter_correspondence_address_Line3: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_correspondence_address.Line3 = value;
      return builder;
    },
    Exporter_correspondence_address_Town: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_correspondence_address.Town = value;
      return builder;
    },
    Exporter_correspondence_address_PostalCode: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_correspondence_address.PostalCode = value;
      return builder;
    },
    Exporter_correspondence_address_Country: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Exporter_correspondence_address.Country = value;
      return builder;
    },
    Industry_sector_code: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Industry_sector_code = value;
      return builder;
    },
    Industry_sector_name: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Industry_sector_name = value;
      return builder;
    },
    Industry_class_code: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Industry_class_code = value;
      return builder;
    },
    Industry_class_name: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Industry_class_name = value;
      return builder;
    },
    Sme_type: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Sme_type = value;
      return builder;
    },
    Description_of_export: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Description_of_export = value;
      return builder;
    },
    Bank_security: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Bank_security = whitespaceCollapse(value);
      return builder;
    },
    Indemnifier_co_hse_reg_number: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_co_hse_reg_number = whitespaceCollapse(value);
      return builder;
    },
    Indemnifier_name: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_name = value;
      return builder;
    },
    Indemnifier_address_Line1: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_address.Line1 = value;
      return builder;
    },
    Indemnifier_address_Line2: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_address.Line2 = value;
      return builder;
    },
    Indemnifier_address_Line3: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_address.Line3 = value;
      return builder;
    },
    Indemnifier_address_Town: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_address.Town = value;
      return builder;
    },
    Indemnifier_address_PostalCode: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_address.PostalCode = value;
      return builder;
    },
    Indemnifier_address_Country: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_address.Country = value;
      return builder;
    },
    Indemnifier_correspondence_address_Line1: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_correspondence_address.Line1 = value;
      return builder;
    },
    Indemnifier_correspondence_address_Line2: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_correspondence_address.Line2 = value;
      return builder;
    },
    Indemnifier_correspondence_address_Line3: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_correspondence_address.Line3 = value;
      return builder;
    },
    Indemnifier_correspondence_address_Town: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_correspondence_address.Town = value;
      return builder;
    },
    Indemnifier_correspondence_address_PostalCode: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_correspondence_address.PostalCode = value;
      return builder;
    },
    Indemnifier_correspondence_address_Country: (value = '') => {
      deal.Deal_information.Exporter_and_indemnifier.Indemnifier_correspondence_address.Country = value;
      return builder;
    },
    Buyer_name: (value = '') => {
      deal.Deal_information.Buyer.Buyer_name = value;
      return builder;
    },
    Buyer_country_code: (value = '') => {
      deal.Deal_information.Buyer.Buyer_country_code = value;
      return builder;
    },
    Destination_country_code: (value = '') => {
      deal.Deal_information.Buyer.Destination_country_code = value;
      return builder;
    },
    Deal_currency_code: (value = '') => {
      deal.Deal_information.Financial.Deal_currency_code = value;
      return builder;
    },
    Conversion_rate: (value = '') => {
      deal.Deal_information.Financial.Conversion_rate = value;
      return builder;
    },
    Conversion_date: (value = '') => {
      deal.Deal_information.Financial.Conversion_date = value;
      return builder;
    },
    Contract_value: (value = '') => {
      deal.Deal_information.Financial.Contract_value = value;
      return builder;
    },
    Ec_agents_check: (value = '') => {
      deal.Eligibility_checklist.Ec_agents_check = value;
      return builder;
    },
    Ec_agents_name: (value = '') => {
      deal.Eligibility_checklist.Agent_name = value;
      return builder;
    },
    Ec_agents_address_line_1: (value = '') => {
      deal.Eligibility_checklist.Agent_address.Line1 = value;
      return builder;
    },
    Ec_agents_address_line_2: (value = '') => {
      deal.Eligibility_checklist.Agent_address.Line2 = value;
      return builder;
    },
    Ec_agents_address_line_3: (value = '') => {
      deal.Eligibility_checklist.Agent_address.Line3 = value;
      return builder;
    },
    Ec_agents_address_town: (value = '') => {
      deal.Eligibility_checklist.Agent_address.Town = value;
      return builder;
    },
    Ec_agents_address_postal_code: (value = '') => {
      deal.Eligibility_checklist.Agent_address.PostalCode = value;
      return builder;
    },
    Ec_agents_address_country: (value = '') => {
      deal.Eligibility_checklist.Agent_address.Country = value;
      return builder;
    },
    Ec_initial_term_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_initial_term_check = value;
      return builder;
    },
    Ec_total_exposure_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_total_exposure_check = value;
      return builder;
    },
    Ec_bond_issuance_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_bond_issuance_check = value;
      return builder;
    },
    Ec_industry_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_industry_check = value;
      return builder;
    },
    Ec_internal_approval_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_internal_approval_check = value;
      return builder;
    },
    Ec_banks_normal_pricing_policies_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_banks_normal_pricing_policies_check = value;
      return builder;
    },
    Ec_requested_cover_start_date_check: (value = nillableNode) => {
      deal.Eligibility_checklist.Ec_requested_cover_start_date_check = value;
      return builder;
    },
    createBSS: typeABSSBuilder,
    addBSS: (bssBuilder) => {
      deal.Facilities.BSS.push(bssBuilder.bss);
      return builder;
    },
    createEWCS: typeAEWCSBuilder,
    addEWCS: (ewcsBuilder) => {
      deal.Facilities.EWCS.push(ewcsBuilder.ewcs);
      return builder;
    },
    Deal_no_facilities: (value = '') => {
      deal.Deal_summary.Deal_no_facilities = value;
      return builder;
    },
    Deal_total_value_deal_cur: (value = '') => {
      deal.Deal_summary.Deal_total_value_deal_cur = Number(value).toFixed(2);
      return builder;
    },
    Deal_total_exposure_gbp: (value = '') => {
      deal.Deal_summary.Deal_total_exposure_gbp = Number(value).toFixed(2);
      return builder;
    },
    Deal_total_premium_gbp: (value = '') => {
      deal.Deal_summary.Deal_total_premium_gbp = Number(value).toFixed(2);
      return builder;
    },
    Deal_total_exposure_deal_cur: (value = '') => {
      deal.Deal_summary.Deal_total_exposure_deal_cur = Number(value).toFixed(2);
      return builder;
    },
    Deal_total_premium_deal_cur: (value = '') => {
      deal.Deal_summary.Deal_total_premium_deal_cur = Number(value).toFixed(2);
      return builder;
    },
    BSS_no_facilities: (value = '') => {
      deal.Deal_summary.BSS_no_facilities = value;
      return builder;
    },
    BSS_total_exposure_gbp: (value = '') => {
      deal.Deal_summary.BSS_total_exposure_gbp = Number(value).toFixed(2);
      return builder;
    },

    BSS_total_premium_gbp: (value = '') => {
      deal.Deal_summary.BSS_total_premium_gbp = Number(value).toFixed(2);
      return builder;
    },
    BSS_total_exposure_deal_cur: (value = '') => {
      deal.Deal_summary.BSS_total_exposure_deal_cur = Number(value).toFixed(2);
      return builder;
    },
    BSS_total_premium_deal_cur: (value = '') => {
      deal.Deal_summary.BSS_total_premium_deal_cur = Number(value).toFixed(2);
      return builder;
    },
    EWCS_no_facilities: (value = '') => {
      deal.Deal_summary.EWCS_no_facilities = value;
      return builder;
    },

    EWCS_total_exposure_gbp: (value = '') => {
      deal.Deal_summary.EWCS_total_exposure_gbp = Number(value).toFixed(2);
      return builder;
    },
    EWCS_total_premium_gbp: (value = '') => {
      deal.Deal_summary.EWCS_total_premium_gbp = Number(value).toFixed(2);
      return builder;
    },
    EWCS_total_exposure_deal_cur: (value = '') => {
      deal.Deal_summary.EWCS_total_exposure_deal_cur = Number(value).toFixed(2);
      return builder;
    },
    EWCS_total_premium_deal_cur: (value = '') => {
      deal.Deal_summary.EWCS_total_premium_deal_cur = Number(value).toFixed(2);
      return builder;
    },

    AddDealFile: (field, type, value) => {
      if (value) {
        const currentFieldDealFiles = deal.Deal_files[field] || [];

        deal.Deal_files[field] = [
          ...currentFieldDealFiles,
          {
            '@': {
              type,
            },
            '#': value,
          }];
      }
      return builder;
    },

    validationErrors,

    build: () => js2xmlparser.parse('Deal', deal),
  };

  return builder;
};
