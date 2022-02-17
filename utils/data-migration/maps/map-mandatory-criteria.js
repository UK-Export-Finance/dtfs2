// const MANDATORY_CRITERIA = require('../../mock-data-loader/mocks/mandatoryCriteria');
const mandatoryCriteriaRequired = require('../helpers/mandatory-criteria-required');

const mapMandatoryCriteria = (v1Deal) => {
  if (mandatoryCriteriaRequired(v1Deal)) {
    // return MANDATORY_CRITERIA;
    return { NEED_TO_FIX: true };
  }
  return [];
};

module.exports = mapMandatoryCriteria;
