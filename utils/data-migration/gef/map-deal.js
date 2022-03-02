const MIGRATION_MAP = require('./migration-map');
const V2_CONSTANTS = require('../../../portal-api/src/constants');
const { getUserByEmail } = require('../helpers/users');
const { convertDateToTimestamp } = require('./helpers');

const mapExporterIndustry = (v1DealExporter) => ({
  code: v1DealExporter.industry_sector.system_value,
  name: v1DealExporter.industry_sector.readable_value,
  class: {
    code: v1DealExporter.industry_class.system_value,
    name: v1DealExporter.industry_class.readable_value,
  },
});

const mapAddress = (v1Address) => ({
  // organisationName: 'TODO',
  addressLine1: v1Address.address,
  addressLine2: v1Address.address_2,
  addressLine3: v1Address.address_3,
  locality: v1Address.locality,
  postalCode: v1Address.postal_code,
  country: v1Address.country,
});

const mapExporter = (v1Exporter) => {
  const mapped = {
    isFinanceIncreasing: Boolean(v1Exporter.financing_increasing),
    companiesHouseRegistrationNumber: v1Exporter.companies_house_registration,
    companyName: v1Exporter.exporter_name, //  TODO: confirm if exporter_name is correct.

    // TODO: check if V1 deal can have multiple industries
    industries: [
      mapExporterIndustry(v1Exporter),
    ],
    probabilityOfDefault: v1Exporter.probability_of_default,
    registeredAddress: mapAddress(v1Exporter.exporter_address_composite),
    selectedIndustry: mapExporterIndustry(v1Exporter),
    smeType: v1Exporter.sme_type.readable_value,
  };

  const correspondenceAddress = v1Exporter.exporter_correspondence_address_composite;

  if (correspondenceAddress) {
    mapped.correspondenceAddress = mapAddress(correspondenceAddress);
  }

  return mapped;
};

const mapEligibility = (v1Eligibility) => {
  // TODO:
  // - security
  // - EC revision?

  const v1CriteriaFieldNames = [
    'question_1',
    'question_2',
    'question_3',
    'question_4',
    'ec_requested_cover_start_date',
    'question_5',
    'ec_facility_base_currency_18',
    'ec_facility_letter_19',
  ];

  const mappedCriteria = v1CriteriaFieldNames.map((criterion) => ({
    id: MIGRATION_MAP.DEAL.ELIGIBILITY_CRITERIA[criterion].id,
    name: MIGRATION_MAP.DEAL.ELIGIBILITY_CRITERIA[criterion].name,
    text: v1Eligibility[criterion].question_text,
    answer: v1Eligibility[criterion].question_answer,
  }));


  const mapped = {
    criteria: mappedCriteria,
  };

  return mapped;
};

const mapSubmissionCount = (submissionType) => {
  if (submissionType === V2_CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
    || submissionType === V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIA) {
    return 1;
  }

  if (submissionType === V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
    return 2;
  }

  return 0;
};

const mapV2 = (v1Deal, v2Users) => {
  const submissionType = MIGRATION_MAP.DEAL.SUBMISSION_TYPE[v1Deal.field_submission_type];

  const mapped = {
    dataMigration: {
      drupalDealId: v1Deal.drupal_id,
    },
    bankInternalRefName: v1Deal.bank_deal_name,
    additionalRefName: v1Deal.field_bank_deal_id, // TODO: is this correct?
    createdAt: convertDateToTimestamp(v1Deal.created),
    updatedAt: convertDateToTimestamp(v1Deal.changed),
    submissionType,
    status: MIGRATION_MAP.DEAL.DEAL_STATUS[v1Deal.field_deal_status],
    submissionDate: convertDateToTimestamp(v1Deal.field_submission_date),
    ukefDealId: v1Deal.field_ukef_deal_id,
    exporter: mapExporter(v1Deal.children.general_info),
    mandatoryVersionId: v1Deal.children.eligiblity.system_red_line_revision_id,
    eligibility: mapEligibility(v1Deal.children.eligiblity),
    submissionCount: mapSubmissionCount(submissionType),
    portalActivities: [],

    // not in json data
    // comments: '',

    // supportingInformation // TODO: examples with multiple files please. Also, how to link these files.
    // is this inn eligibility? will it be file_1, file_2?

    // need confirmation of what field(s) should be used
    // ukefDecisionAccepted: '',
    // ukefDecision: '',
    // manualInclusionNoticeSubmissionDate: '', 

    // ukefDecision: [
    //   {
    //     decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    //     timestamp: Date.now(),
    //   }
    // ]
  };

  if (v1Deal.field_min_maker) {
    mapped.maker = getUserByEmail(v2Users, v1Deal.owner.email);
  } else {
     // TODO: is owner correct?
    mapped.maker = getUserByEmail(v2Users, v1Deal.owner.email);
  }

  if (v1Deal.field_min_checker.length) {
    mapped.checkerId = getUserByEmail(v2Users, v1Deal.field_min_checker[0].email)._id;
  } else {
    mapped.checkerId = getUserByEmail(v2Users, v1Deal.field_initial_checker.email)._id;
  }

  return mapped;
};


module.exports = mapV2;
