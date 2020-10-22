const log = require('../helpers/log');
const { getCountryById } = require('../helpers/countries');

const idMap = {
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

const getCriteria = (ecList) => {
  const criteria = ecList.Extra_fields.Ec_answers.Ec_answer.map((v1Ec) => {
    const ecAnswer = {
      id: idMap[v1Ec.System_name],
      description: v1Ec.Description,
    };
    if (v1Ec.Answer) {
      ecAnswer.answer = v1Ec.Answer === 'True';
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

  const eligibility = {
    criteria: getCriteria(ecList),
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
