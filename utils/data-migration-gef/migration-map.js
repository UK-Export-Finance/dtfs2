const V2_CONSTANTS = require('../../portal-api/src/constants');

const DEAL_STATUS = {
  draft: V2_CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
  ready_for_approval: V2_CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
  further_input_required: V2_CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED,
  abandoned_deal: V2_CONSTANTS.DEAL.DEAL_STATUS.ABANDONED,
  submitted: V2_CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF,
  submission_acknowledged: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  in_progress_by_ukef: V2_CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS_BY_UKEF,
  approved: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
  approved_conditions: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
  refused: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED,
  confirmed_by_bank: V2_CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF,
  confirmation_acknowledged: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_ACKNOWLEDGED,
};

const ELIGIBILITY_CRITERIA = {
  question_1: {
    id: 12,
    name: 'coverStart',
  },
  question_2: {
    id: 13,
    name: 'noticeDate',
  },
  question_3: {
    id: 14,
    name: 'facilityLimit',
  },
  question_4: {
    id: 15,
    name: 'exporterDeclaration',
  },
  ec_requested_cover_start_date: {
    id: 16,
    name: 'dueDiligence',
  },
  question_5: {
    id: 17,
    name: 'facilityLetter',
  },
  ec_facility_base_currency_18: {
    id: 18,
    name: 'facilityBaseCurrency',
  },
  ec_facility_letter_19: {
    id: 19,
    name: 'facilityPaymentCurrency',
  },
};

const SUBMISSION_TYPE = {
  atp: V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
  non_atp: V2_CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
  atp_bank_confirmed: V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
};

const DEAL = {
  DEAL_STATUS,
  ELIGIBILITY_CRITERIA,
  SUBMISSION_TYPE,
};

module.exports = {
  DEAL,
};
