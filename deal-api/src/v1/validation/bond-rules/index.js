const bondType = require('./bond-type');
const bondStage = require('./bond-stage');
const bondStageUnissued = require('./bond-stage-unissued');
const bondStageIssued = require('./bond-stage-issued-rules');
const bondValue = require('./bond-value');
const currencySameAsSupplyContractCurrency = require('./currency-same-as-supply-contract');
const currencyNotTheSameAsSupplyContractCurrency = require('./currency-not-the-same-as-supply-contract-rules');
const riskMarginFee = require('./risk-margin-fee');
const coveredPercentage = require('./covered-percentage');
const minimumRiskMarginFee = require('./minimum-risk-margin-fee');
const feeType = require('./fee-type');
const dayCountBasis = require('./day-count-basis');

const rules = [
  bondType,
  bondStage,
  bondStageUnissued,
  bondStageIssued,
  bondValue,
  currencySameAsSupplyContractCurrency,
  currencyNotTheSameAsSupplyContractCurrency,
  riskMarginFee,
  coveredPercentage,
  minimumRiskMarginFee,
  feeType,
  dayCountBasis,
];

module.exports = (submissionDetails) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](submissionDetails, errorList);
  }

  return errorList;
};
