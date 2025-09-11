const k2Map = require('../helpers/k2-mapping');
const CONSTANTS = require('../../../../portal-api/server/constants');

const findPortalValue = (v1Value, v1FieldName, v2FieldType, v2FieldName, logError) => {
  const v2Value = k2Map.findPortalValue(v2FieldType, v2FieldName, v1Value);
  if (v1Value && v2Value === v1Value) {
    logError(`${v1FieldName}: ${v1Value} did not map to v2 ${v2FieldType}.${v2FieldName}`);
    console.error(`${v1FieldName}: ${v1Value} did not map to v2 ${v2FieldType}.${v2FieldName}`);
  }
  return v2Value;
};

// eslint-disable-next-line no-unused-vars
const findFacilityStageValue = (v1Value, v1FieldName, type, logError) => {
  const mappedStage = Object.entries(CONSTANTS.FACILITIES.FACILITIES_STAGE[type]).find((s) => s === v1Value);
  if (v1Value && !mappedStage) {
    logError(`${v1FieldName}: ${v1Value} did not map to v2 FACILITIES_STAGE.${type}`);
    console.error('%s %s did not map to v2 FACILITIES_STAGE %s', v1FieldName, v1Value, type);
  }
  return mappedStage;
};

module.exports = findPortalValue;
