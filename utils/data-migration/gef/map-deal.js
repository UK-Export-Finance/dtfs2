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
  addressLine1: v1Address.address,
  addressLine2: v1Address.address_2 || null,
  addressLine3: v1Address.address_3 || null,
  locality: v1Address.locality,
  postalCode: v1Address.postal_code,
  country: v1Address.country,
});

const mapExporter = (v1Exporter) => {
  const mapped = {
    organisationName: v1Exporter.exporter_name,
    companiesHouseRegistrationNumber: v1Exporter.companies_house_registration || null,
    companyName: v1Exporter.exporter_name,

    // TODO: check if V1 deal can have multiple industries
    industries: [
      mapExporterIndustry(v1Exporter),
    ],
    probabilityOfDefault: Number(v1Exporter.probability_of_default),
    registeredAddress: mapAddress(v1Exporter.exporter_address_composite),
    selectedIndustry: mapExporterIndustry(v1Exporter),
    smeType: v1Exporter.sme_type.readable_value,
    isFinanceIncreasing: Boolean(v1Exporter.financing_increasing.toLowerCase()),
  };

  const correspondenceAddress = v1Exporter.exporter_correspondence_address_composite;

  if (correspondenceAddress) {
    mapped.correspondenceAddress = mapAddress(correspondenceAddress);
  }

  return mapped;
};

const mapEligibility = (v1Eligibility) => {
  const v1CriteriaFieldNames = Object.getOwnPropertyNames(MIGRATION_MAP.DEAL.ELIGIBILITY_CRITERIA);

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

const mapUkefDecision = (v1Deal, status) => {
  if (status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED) {
    return [
      {
        decision: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED,
        // text: field_special_conditions, // TODO
      },
    ];
  }

  if (v1Deal.field_special_conditions.length) {
    return [
      {
        decision: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
        text: field_special_conditions
      },
    ];
  }

  return [
    {
      decision: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    },
  ];
};

const mapV1Deal = (v1Deal, v2Users) => {
  const submissionType = MIGRATION_MAP.DEAL.SUBMISSION_TYPE[v1Deal.field_submission_type];
  const status = MIGRATION_MAP.DEAL.DEAL_STATUS[v1Deal.field_deal_status];

  const mapped = {
    dataMigration: {
      drupalDealId: String(v1Deal.drupal_id),
    },
    bankInternalRefName: v1Deal.field_bank_deal_id,
    additionalRefName: v1Deal.bank_deal_name,
    createdAt: convertDateToTimestamp(v1Deal.created),
    updatedAt: convertDateToTimestamp(v1Deal.changed),
    mandatoryVersionId: Number(v1Deal.children.eligiblity.system_red_line_revision_id),
    submissionType,
    status,
    submissionDate: convertDateToTimestamp(v1Deal.field_submission_date),
    ukefDealId: v1Deal.field_ukef_deal_id,
    exporter: mapExporter(v1Deal.children.general_info),
    eligibility: mapEligibility(v1Deal.children.eligiblity),
    eligibilityVersionId: Number(v1Deal.children.eligiblity.system_revision_id),
    submissionCount: mapSubmissionCount(submissionType),
    portalActivities: [],
    manualInclusionNoticeSubmissionDate: convertDateToTimestamp(v1Deal.field_min_checker_date),

    // TODO: (not in json data, waiting)
    // comments
    // - mandatory criteria in deal / other collection
    //   - need mandatory criteria version - full data
    // - ecRevision

    // TODO: investigate.
    // supportingInformation / deal files.
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

  if (v1Deal.field_min_checker_date) {
    mapped.manualInclusionNoticeSubmissionDate = convertDateToTimestamp(v1Deal.field_min_checker_date);
  }

  mapped.ukefDecision = mapUkefDecision(v1Deal, status);

  if (mapped.status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
    mapped.ukefDecisionAccepted = v1Deal.field_i_agree_with_special_cond;
  }

  if (mapped.status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS) {
    mapped.ukefDecisionAccepted = v1Deal.field_i_agree_with_conditions;
  }

  return mapped;
};


module.exports = mapV1Deal;
