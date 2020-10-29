const log = require('../helpers/log');
const { getCountryById } = require('../helpers/countries');
const mandatoryCriteriaRequired = require('../helpers/mandatory-criteria-required');

const idMapV1 = {
  Ec_agents_check: 1,
  Ec_initial_term_check: 2,
  Ec_total_exposure_check: 3,
  Ec_bond_issuance_check: 4,
  Ec_industry_check: 11,
  Ec_indemnifier_turnover_check: 12,
  Ec_indemnifier_net_worth_check: 13,
  Ec_indemnifier_liquidity_check: 14,
  Ec_indemnifier_filed_accounts_check: 15,
  Ec_indemnifier_watchlist_check: 16,
  Ec_indemnifier_rating_check: 17,
  Ec_internal_approval_check: 18,
  Ec_third_party_check: 10,
  Ec_bank_facility_letter_check: 19,
  Ec_banks_normal_pricing_policies_check: 20,
  Ec_fees_interest_frequency_check: 21,
  Ec_affiliate_to_the_supplier_check: 9,
  Ec_requested_cover_start_date_check: 8,
  Ec_supplier_declaration_check: 5,
  Ec_affected_transaction_check: 6,
  Ec_bank_complied_check: 7,
  Ec_bank_sole_beneficial_owner_check: 22,
  Ec_disposal_risk_transfer_check: 23,
  Ec_consent_obligor_check: 24,
  Ec_agreement_with_obligor_check: 25,
};

const idMapV2 = {
  Ec_agents_check: 11,
  Ec_initial_term_check: 12,
  Ec_total_exposure_check: 13,
  Ec_bond_issuance_check: 14,
  Ec_industry_check: 16,
  Ec_indemnifier_turnover_check: '',
  Ec_indemnifier_net_worth_check: '',
  Ec_indemnifier_liquidity_check: '',
  Ec_indemnifier_filed_accounts_check: '',
  Ec_indemnifier_watchlist_check: '',
  Ec_indemnifier_rating_check: '',
  Ec_internal_approval_check: 17,
  Ec_third_party_check: '',
  Ec_bank_facility_letter_check: '',
  Ec_banks_normal_pricing_policies_check: 18,
  Ec_fees_interest_frequency_check: '',
  Ec_affiliate_to_the_supplier_check: '',
  Ec_requested_cover_start_date_check: 15,
  Ec_supplier_declaration_check: '',
  Ec_affected_transaction_check: '',
  Ec_bank_complied_check: '',
  Ec_bank_sole_beneficial_owner_check: '',
  Ec_disposal_risk_transfer_check: '',
  Ec_consent_obligor_check: '',
  Ec_agreement_with_obligor_check: '',
};

const getGroup = (id) => {
  if (id <= 10) {
    return 'Supply Contract / Transaction criteria';
  }

  if (id <= 11) {
    return 'Controlled Sectors';
  }

  if (id <= 15) {
    return 'Financial criteria';
  }

  if (id <= 17) {
    return 'Credit criteria';
  }

  if (id <= 18) {
    return 'Bank due diligence';
  }

  if (id <= 21) {
    return 'Bank facility letter criteria';
  }

  return 'Legal criteria';
};


const getCriteria = (ecList, idMap, hasMandatoryCriteria) => {
  const criteria = ecList.Extra_fields.Ec_answers.Ec_answer.map((v1Ec) => {
    const id = idMap[v1Ec.System_name];

    const ecAnswer = {
      id,
      description: v1Ec.Description,
    };

    if (v1Ec.Answer) {
      ecAnswer.answer = v1Ec.Answer === 'True';
    } else if (!hasMandatoryCriteria) {
      ecAnswer.answer = 'Not Applicable';
    }

    if (!hasMandatoryCriteria) {
      ecAnswer.group = getGroup(id);
    }

    return ecAnswer;
  });
  return criteria.sort((c1, c2) => c1.id - c2.id);
};

const getV1ExtraInfo = (ecList) => ({
  ecRevision: ecList.Extra_fields.Ec_revision,
  mandatoryCriteriaUsed: ecList.Extra_fields.Mandatory_criteria_used,
  mandatoryCriteriaRevision: ecList.Extra_fields.Mandatory_criteria_revision,
});

const mapEligibility = (portalDealId, v1Deal) => {
  let hasError = false;
  const logError = (error) => {
    hasError = false;
    log.addError(portalDealId, error);
  };

  const { Eligibility_checklist: ecList } = v1Deal;

  const country = getCountryById(ecList.Agent_address.Country);

  const { idMap, hasMandatoryCriteria } = mandatoryCriteriaRequired(v1Deal)
    ? { idMap: idMapV2, hasMandatoryCriteria: true }
    : { idMap: idMapV1, hasMandatoryCriteria: false };

  const eligibility = {
    criteria: getCriteria(ecList, idMap, hasMandatoryCriteria),
    v1ExtraInfo: getV1ExtraInfo(ecList),
    agentName: ecList.Agent_name,
    agentAddressCountry: country ? country.code : '',
    agentAddressLine1: ecList.Agent_address.Line1,
    agentAddressLine2: ecList.Agent_address.Line2,
    agentAddressLine3: ecList.Agent_address.Line3,
    agentAddressTown: ecList.Agent_address.Town,
    agentAddressPostcode: ecList.Agent_address.PostalCode,
    status: 'Completed',
  };

  return [
    eligibility,
    hasError,
  ];
};

module.exports = mapEligibility;
