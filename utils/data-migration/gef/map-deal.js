const { ObjectID } = require('bson');
const MIGRATION_MAP = require('./migration-map');
const V2_CONSTANTS = require('../../../portal-api/src/constants');
const { exporterStatus } = require('../../../portal-api/src/v1/gef/controllers/validation/exporter');
const { getUserByEmail } = require('../helpers/users');
const { getBankByName } = require('../helpers/banks');
const { convertDateToTimestamp } = require('./helpers');
const api = require('../api');

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

  mapped.status = exporterStatus(mapped);

  return mapped;
};

const mapEligibility = async (token, v1Eligibility) => {
  // NOTE: at the time of V1 migration, all GEF v1 deals have only one eligibility criteria version.
  // v1Eligibility.system_revision_id could be used, but this can be empty.
  const V1_EC_VERSION = 1.5;

  const eligibilityCriteria = await api.getGefEligibilityCriteria(token, V1_EC_VERSION);
  const v1CriteriaFieldNames = Object.getOwnPropertyNames(MIGRATION_MAP.DEAL.ELIGIBILITY_CRITERIA);

  const mappedCriteria = v1CriteriaFieldNames.map((v1Criterion) => {
    const id = MIGRATION_MAP.DEAL.ELIGIBILITY_CRITERIA[v1Criterion].id;

    const text = eligibilityCriteria.terms.find((c) => c.id === id).text;

    return {
      id,
      name: MIGRATION_MAP.DEAL.ELIGIBILITY_CRITERIA[v1Criterion].name,
      text,
      answer: v1Eligibility[v1Criterion].answer,
    };
  });

  const mapped = {
    version: eligibilityCriteria.version,
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
        text: v1Deal.field_deal_comments,
      },
    ];
  }

  if (v1Deal.field_special_conditions.length) {
    return [
      {
        decision: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
        text: v1Deal.field_special_conditions
      },
    ];
  }

  return [
    {
      decision: V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    },
  ];
};

const mapComments = (v1Comments, v2Users) => {
  const mapped = v1Comments.map((v1Comment) => {
    const user = getUserByEmail(v2Users, v1Comment.user_email);

    return {
      email: user.email,
      roles: user.roles,
      userName: user.username,
      firstname: user.firstname,
      surname: user.surname,
      comment: v1Comment.comment,
    };
  });

  return mapped;
};

const mapDocuments = (documents, path) => {
  const documentsArray = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of documents) {
    // split the v1Url at `://` - this to get the full path to the file
    const url = item.url.split('://');
    // split the new url at `/` - this to get the file name
    const filename = url[1].split('/');
    documentsArray.push({
      _id: ObjectID(),
      parentId: '',
      v1Url: url[1],
      filename: filename[filename.length - 1],
      documentPath: path,
      size: 'Unknown'
    });
  }

  return documentsArray;
};

const mapSupportingInformation = (v1Eligibility) => {
  const mapped = {
    security: {
      exporter: '',
      facility: ''
    }
  };

  if (v1Eligibility.file_1) {
    mapped.manualInclusion = mapDocuments(v1Eligibility.file_1, MIGRATION_MAP.DEAL.SUPPORTING_INFORMATION.file_1);
  }

  if (v1Eligibility.file_2) {
    mapped.auditedFinancialStatements = mapDocuments(v1Eligibility.file_2, MIGRATION_MAP.DEAL.SUPPORTING_INFORMATION.file_2);
  }

  if (v1Eligibility.file_3) {
    mapped.yearToDateManagement = mapDocuments(v1Eligibility.file_3, MIGRATION_MAP.DEAL.SUPPORTING_INFORMATION.file_3);
  }

  if (v1Eligibility.file_4) {
    mapped.financialForecasts = mapDocuments(v1Eligibility.file_4, MIGRATION_MAP.DEAL.SUPPORTING_INFORMATION.file_4);
  }

  if (v1Eligibility.file_5) {
    mapped.financialInformationCommentary = mapDocuments(v1Eligibility.file_5, MIGRATION_MAP.DEAL.SUPPORTING_INFORMATION.file_5);
  }

  if (v1Eligibility.file_6) {
    mapped.corporateStructure = mapDocuments(v1Eligibility.file_6, MIGRATION_MAP.DEAL.SUPPORTING_INFORMATION.file_6);
  }

  if (v1Eligibility.security) {
    mapped.security.exporter = v1Eligibility.security;
  }

  return mapped;
};

const mapV1Deal = async (token, v1Deal, v2Banks, v2Users) => {
  const submissionType = MIGRATION_MAP.DEAL.SUBMISSION_TYPE[v1Deal.field_submission_type];
  const status = MIGRATION_MAP.DEAL.DEAL_STATUS[v1Deal.field_deal_status];
  const isManualSubmission = (submissionType === V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
                            || submissionType === V2_CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);
  const mapped = {
    dataMigration: {
      drupalDealId: String(v1Deal.drupal_id),
    },
    dealType: V2_CONSTANTS.DEAL.DEAL_TYPE.GEF,
    bankInternalRefName: v1Deal.field_bank_deal_id,
    additionalRefName: v1Deal.bank_deal_name,
    createdAt: convertDateToTimestamp(v1Deal.created),
    updatedAt: convertDateToTimestamp(v1Deal.changed),
    bank: getBankByName(v2Banks, v1Deal.owner.bank),
    mandatoryVersionId: Number(v1Deal.children.eligiblity.system_red_line_revision_id),
    submissionType,
    status,
    submissionDate: convertDateToTimestamp(v1Deal.field_submission_date),
    ukefDealId: v1Deal.field_ukef_deal_id,
    exporter: mapExporter(v1Deal.children.general_info),
    eligibility: await mapEligibility(token, v1Deal.children.eligiblity),
    submissionCount: mapSubmissionCount(submissionType),
    portalActivities: [],
    manualInclusionNoticeSubmissionDate: convertDateToTimestamp(v1Deal.field_min_checker_date),
    comments: mapComments(v1Deal.children.comments_maker_checker, v2Users),
    ukefDecision: mapUkefDecision(v1Deal, status),
    supportingInformation: {},
  };

  if (v1Deal.field_min_maker) {
    mapped.maker = getUserByEmail(v2Users, v1Deal.field_min_maker.email);
  } else {
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

  if (mapped.status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS) {
    mapped.ukefDecisionAccepted = v1Deal.field_i_agree_with_special_cond;
  }

  if (mapped.status === V2_CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS) {
    mapped.ukefDecisionAccepted = v1Deal.field_i_agree_with_conditions;
  }

  if (isManualSubmission) {
    mapped.supportingInformation = mapSupportingInformation(v1Deal.children.eligiblity);
  }

  return mapped;
};

module.exports = mapV1Deal;
