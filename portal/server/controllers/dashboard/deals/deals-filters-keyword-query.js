const CONSTANTS = require('../../../constants');
const { generateKeywordQuery } = require('../filters/generate-keyword-query');

const dashboardDealsFiltersKeywordQuery = (keywordValue) => {
  const fields = [
    CONSTANTS.FIELD_NAMES.DEAL.BANK_INTERNAL_REF_NAME,
    CONSTANTS.FIELD_NAMES.DEAL.STATUS,
    CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE,
    CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
    CONSTANTS.FIELD_NAMES.DEAL.EXPORTER_COMPANY_NAME,
    CONSTANTS.FIELD_NAMES.DEAL.GEF_UKEF_DEAL_ID,
    CONSTANTS.FIELD_NAMES.DEAL.BSS_EWCS_UKEF_DEAL_ID,
  ];

  const keywordQuery = generateKeywordQuery(
    fields,
    keywordValue,
  );

  return keywordQuery;
};

module.exports = dashboardDealsFiltersKeywordQuery;
