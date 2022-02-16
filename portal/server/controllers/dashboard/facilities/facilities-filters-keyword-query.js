const CONSTANTS = require('../../../constants');
const { generateKeywordQuery } = require('../filters/generate-keyword-query');

const dashboardFacilitiesFiltersKeywordQuery = (keywordValue) => {
  const fields = [
    CONSTANTS.FIELD_NAMES.FACILITY.DEAL_SUBMISSION_TYPE,
    CONSTANTS.FIELD_NAMES.FACILITY.NAME,
    CONSTANTS.FIELD_NAMES.FACILITY.UKEF_FACILITY_ID,
    CONSTANTS.FIELD_NAMES.FACILITY.CURRENCY,
    CONSTANTS.FIELD_NAMES.FACILITY.VALUE,
    CONSTANTS.FIELD_NAMES.FACILITY.TYPE,
  ];

  const keywordQuery = generateKeywordQuery(
    fields,
    keywordValue,
  );

  return keywordQuery;
};

module.exports = dashboardFacilitiesFiltersKeywordQuery;
