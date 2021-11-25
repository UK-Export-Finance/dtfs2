const { getMandatoryCriteria, validateMandatoryCriteria } = require('../mandatory-criteria');

const cloneDealMandatoryCriteria = async (req, res) => {
  getMandatoryCriteria(req, res);
};

const cloneDealPostMandatoryCriteria = async (req, res) => {
  validateMandatoryCriteria(req, res);
};

module.exports = { cloneDealMandatoryCriteria, cloneDealPostMandatoryCriteria };
