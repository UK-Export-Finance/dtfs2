const MANDATORY_CRITERIA = require('../../../mock-data-loader/bss/mandatoryCriteria');
const mandatoryCriteriaRequired = require('../helpers/mandatory-criteria-required');

const mapMandatoryCriteria = (v1Deal) => {
  if (mandatoryCriteriaRequired(v1Deal)) {
    return { ...MANDATORY_CRITERIA.filter((criteria) => criteria.version === 30) };
  }
  return [];
};

module.exports = mapMandatoryCriteria;
