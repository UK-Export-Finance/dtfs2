const bankReferenceNumber = require('./bank-reference-number');
const facilityStage = require('./facility-stage');
const facilityStageConditional = require('./facility-stage-conditional');
const facilityStageUnconditional = require('./facility-stage-unconditional');

const rules = [
  bankReferenceNumber,
  facilityStage,
  facilityStageConditional,
  facilityStageUnconditional,
];

module.exports = (submissionDetails) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](submissionDetails, errorList);
  }

  return errorList;
};
