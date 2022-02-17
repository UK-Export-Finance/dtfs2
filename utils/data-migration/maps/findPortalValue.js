const { k2Map } = require('../../../portal-api/src/v1/controllers/integration/helpers');
const CONSTANTS = require('../../../portal-api/src/constants');

const findPortalValue = (v1Value, v1FieldName, v2FieldType, v2FieldName, logError) => {
  const v2Value = k2Map.findPortalValue(v2FieldType, v2FieldName, v1Value); 
  if (v1Value && v2Value === v1Value) {
    // logError(`${v1FieldName}: ${v1Value} did not map to v2 ${v2FieldType}.${v2FieldName}`);
    console.log(`${v1FieldName}: ${v1Value} did not map to v2 ${v2FieldType}.${v2FieldName}`);
  }
  return v2Value;
};

const findFacilityStageValue = (v1Value, v1FieldName, type, logError) => {
  const mappedStage = Object.entries(CONSTANTS.FACILITIES.FACILITIES_STAGE[type]).find((s) => s === v1Value);
  // if (v1Value && !mappedStage) {
  //   logError(`${v1FieldName}: ${v1Value} did not map to v2 FACILTIES_STAGE.${type}`);
  // }
  return mappedStage;
};

module.exports = findPortalValue;
