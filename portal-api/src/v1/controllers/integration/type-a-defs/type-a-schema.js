const countryCodeType = 'integer';
const currencyCode = 'integer';
const dateType = 'regex:/(\\d{2}-\\d{2}-\\d{4})?/';
const currencyType = ['numeric', 'digits_between:0,20', 'regex:/^\\d+(\\.\\d{2})?$/'];
const percentType = 'regex:/^\\d+(\\.\\d{1,4})?$/';

const multipleDealFiles = {
  '*': {
    '@': {
      type: ['required', 'in:general_correspondence,financials'],
    },
  },
};

const addressType = {
  Line1: ['string', 'max:50'],
  Line2: ['string', 'max:50'],
  Line3: ['string', 'max:50'],
  Town: ['string', 'max:50'],
  PostalCode: ['string', 'max:12'],
  Country: countryCodeType,
};

const typeADealSchema = {
  '@': {
    action_code: ['required', 'in:001,003,010,016'],
    action_name: ['required', 'in:NewDeal,AmendDeal,ATPConfirm'],
    portal_deal_id: 'required',
    application_group: ['required', 'in:EWCS,BSS,BSS and EWCS'],
    message_type: ['required', 'in:A'],
    revision_id: ['required', 'integer'],
  },
  General_information: {
    Deal_name: 'string',
    Bank_deal_id: 'string',
  },
  Application_route: 'in:ATP,Non-ATP',
  Application_owner: 'string',
  Application_owner_email: 'string',
  Application_bank: 'string',
  Application_bank_co_hse_reg_number: 'string',
  UKEF_deal_id: 'string',
  Deal_information: {
    Exporter_and_indemnifier: {
      Customer_type: 'in:1,2',
      Exporter_co_hse_reg_number: ['string', 'max:10'],
      Exporter_registration_source: 'in:Companies House',
      Exporter_name: ['string', 'max:150'],
      Exporter_address: addressType,
      Exporter_correspondence_address: addressType,
      Industry_sector_code: 'string',
      Industry_sector_name: 'string',
      Industry_class_code: 'string',
      Industry_class_name: 'string',
      Sme_type: 'in:1,2,3,4,5',
      Description_of_export: 'string',
      Bank_security: ['string', 'max:300'],
      Indemnifier_co_hse_reg_number: ['string', 'max:10'],
      Indemnifier_name: ['string', 'max:150'],
      Indemnifier_address: addressType,
      Indemnifier_correspondence_address: addressType,
    },
    Buyer: {
      Buyer_name: ['string', 'max:150'],
      Buyer_country_code: countryCodeType,
      Destination_country_code: countryCodeType,
    },
    Financial: {
      Deal_currency_code: currencyCode,
      Conversion_rate: ['numeric', 'min:0'],
      Conversion_date: dateType,
      Contract_value: currencyType,
    },
  },
  Eligibility_checklist: {
    Ec_agents_check: 'boolean',
    Ec_initial_term_check: 'nillableNode:boolean',
    Ec_total_exposure_check: 'nillableNode:boolean',
    Ec_bond_issuance_check: 'nillableNode:boolean',
    Ec_industry_check: 'nillableNode:boolean',
    Ec_indemnifier_turnover_check: 'nillableNode:boolean',
    Ec_indemnifier_net_worth_check: 'nillableNode:boolean',
    Ec_indemnifier_liquidity_check: 'nillableNode:boolean',
    Ec_indemnifier_filed_accounts_check: 'nillableNode:boolean',
    Ec_indemnifier_watchlist_check: 'nillableNode:boolean',
    Ec_indemnifier_rating_check: 'nillableNode:boolean',
    Ec_internal_approval_check: 'nillableNode:boolean',
    Ec_third_party_check: 'nillableNode:boolean',
    Ec_bank_facility_letter_check: 'nillableNode:boolean',
    Ec_banks_normal_pricing_policies_check: 'nillableNode:boolean',
    Ec_fees_interest_frequency_check: 'nillableNode:boolean',
    Ec_affiliate_to_the_supplier_check: 'nillableNode:boolean',
    Ec_requested_cover_start_date_check: 'nillableNode:boolean',
    Ec_supplier_declaration_check: 'nillableNode:boolean',
    Ec_affected_transaction_check: 'nillableNode:boolean',
    Ec_bank_complied_check: 'nillableNode:boolean',
    Ec_bank_sole_beneficial_owner_check: 'nillableNode:boolean',
    Ec_disposal_risk_transfer_check: 'nillableNode:boolean',
    Ec_consent_obligor_check: 'nillableNode:boolean',
    Ec_agreement_with_obligor_check: 'nillableNode:boolean',
    Agent_name: 'string',
    Agent_address: addressType,
  },
  Facilities: {
    BSS: {
      '*': {
        UKEF_BSS_facility_id: 'string',
        BSS_Guarantee_details: {
          BSS_portal_facility_id: 'string', // type_a.xsd specifies integer but we think this is just the reference to portal and not required by workflow
          BSS_bank_id: ['string', 'max:30'],
          BSS_issuer: ['string', 'max:150'],
          BSS_type: 'in:1,2,3,4,5,6,7,8,9',
          BSS_stage: 'in:2,3',
          BSS_beneficiary: ['string', 'max:150'],
        },
        BSS_Financial_details: {
          BSS_value: currencyType,
          BSS_currency_code: currencyCode,
          BSS_conversion_rate_deal: ['numeric', 'min:0'],
          BSS_conversion_date_deal: dateType,
          BSS_fee_rate: percentType,
          BSS_fee_perc: ['between:1,100', percentType],
          BSS_guarantee_perc: ['between:1,100', percentType],
          BSS_max_liability: currencyType,
          BSS_min_quarterly_fee: 'numeric',
        },
        BSS_Dates_repayments: {
          BSS_premium_freq: 'in:1,2,3,4',
          BSS_premium_type: 'in:1,2,3',
          BSS_cover_start_date: dateType,
          BSS_issue_date: dateType,
          BSS_cover_end_date: dateType,
          BSS_cover_period: 'integer',
          BSS_day_basis: 'in:1,2',
        },
      },
    },
    EWCS: {
      '*': {
        UKEF_EWCS_facility_id: 'string',
        EWCS_Guarantee_details: {
          EWCS_portal_facility_id: 'string',
          EWCS_bank_id: ['string', 'max:30'],
          EWCS_stage: 'in:2,3',
        },
        EWCS_Financial_details: {
          EWCS_value: currencyType,
          EWCS_currency_code: currencyCode,
          EWCS_conversion_rate_deal: ['numeric', 'min:0'],
          EWCS_conversion_date_deal: dateType,
          EWCS_disbursement_amount: ['string', 'regex:/^\\d{1,14}(\\.\\d{1,4})?$/'],
          EWCS_interest_rate: percentType,
          EWCS_fee_perc: ['between:1,100', percentType],
          EWCS_guarantee_perc: ['between:1,100', percentType],
          EWCS_max_liability: percentType,
          EWCS_min_quarterly_fee: 'decimal',
        },
        EWCS_Dates_repayments: {
          EWCS_premium_type: 'in:1,2,3',
          EWCS_premium_freq: 'in:1,2,3,4',
          EWCS_cover_start_date: dateType,
          EWCS_issue_date: dateType,
          EWCS_cover_end_date: dateType,
          EWCS_cover_period: 'integer',
          EWCS_day_basis: 'in:1,2',
        },
      },
    },
  },
  Deal_summary: {
    Deal_no_facilities: ['integer', 'min:1'],
    Deal_total_value_deal_cur: 'numeric',
    Deal_total_exposure_gbp: 'numeric',
    Deal_total_premium_gbp: 'numeric',
    Deal_total_exposure_deal_cur: 'numeric',
    Deal_total_premium_deal_cur: 'numeric',
    BSS_no_facilities: ['integer', 'min:0'],
    BSS_total_exposure_gbp: 'numeric',
    BSS_total_premium_gbp: 'numeric',
    BSS_total_exposure_deal_cur: 'numeric',
    BSS_total_premium_deal_cur: 'numeric',
    EWCS_no_facilities: ['integer', 'min:0'],
    EWCS_total_exposure_gbp: 'numeric',
    EWCS_total_premium_gbp: 'numeric',
    EWCS_total_exposure_deal_cur: 'numeric',
    EWCS_total_premium_deal_cur: 'numeric',
  },
  Deal_files: {
    Exporter_questionnaire: multipleDealFiles,
    Audited_financial_statements: multipleDealFiles,
    Year_to_date_management: multipleDealFiles,
    Financial_forecasts: multipleDealFiles,
    Financial_information_commentary: multipleDealFiles,
    Corporate_structure: multipleDealFiles,
  },
};

module.exports = typeADealSchema;
