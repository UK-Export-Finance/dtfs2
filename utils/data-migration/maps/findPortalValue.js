const { k2Map } = require('../../../deal-api/src/v1/controllers/integration/helpers');

const findPortalValue = (v1Value, v1FieldName, v2FieldType, v2FieldName, logError) => {
  const v2Value = k2Map.findPortalValue(v2FieldType, v2FieldName, v1Value);
  if (v2Value === v1Value) {
    logError(`${v1FieldName}: ${v1Value} did not map to v2 ${v2FieldType}.${v2FieldName}`);
  }
  return v2Value;
};

module.exports = findPortalValue;
