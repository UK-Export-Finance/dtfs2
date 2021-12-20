const bondType = require('./bond-type');
const facilityStage = require('./facility-stage');
const facilityStageUnissued = require('./facility-stage-unissued');
const facilityStageIssued = require('./facility-stage-issued-rules');
const value = require('./facility-value');
const currencySameAsSupplyContractCurrency = require('../fields/currency-same-as-supply-contract');
const currencyNotTheSameAsSupplyContractCurrency = require('../fields/currency-not-the-same-as-supply-contract-rules');
const riskMarginFee = require('./risk-margin-fee');
const coveredPercentage = require('../fields/covered-percentage');
const minimumRiskMarginFee = require('./minimum-risk-margin-fee');
const feeType = require('./fee-type');
const dayCountBasis = require('../fields/day-count-basis');

const rules = [
  bondType,
  facilityStage,
  facilityStageUnissued,
  facilityStageIssued,
  value,
  currencySameAsSupplyContractCurrency,
  currencyNotTheSameAsSupplyContractCurrency,
  riskMarginFee,
  coveredPercentage,
  minimumRiskMarginFee,
  feeType,
  dayCountBasis,
];

module.exports = (bond, deal) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](bond, errorList, deal);
  }

  return errorList;
};
