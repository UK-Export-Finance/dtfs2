const facilityStage = require('./facility-stage');
const facilityStageConditional = require('./facility-stage-conditional');
const facilityStageUnconditional = require('./facility-stage-unconditional');
const value = require('./facility-value');
const currencySameAsSupplyContractCurrency = require('../fields/currency-same-as-supply-contract');
const currencyNotTheSameAsSupplyContractCurrency = require('../fields/currency-not-the-same-as-supply-contract-rules');
const interestMarginFee = require('./interest-margin-fee');
const coveredPercentage = require('../fields/covered-percentage');
const minimumQuarterlyFee = require('./minimum-quarterly-fee');
const premiumType = require('./premium-type');
const dayCountBasis = require('../fields/day-count-basis');

const rules = [
  facilityStage,
  facilityStageConditional,
  facilityStageUnconditional,
  value,
  currencySameAsSupplyContractCurrency,
  currencyNotTheSameAsSupplyContractCurrency,
  interestMarginFee,
  coveredPercentage,
  minimumQuarterlyFee,
  premiumType,
  dayCountBasis,
];

module.exports = (loan, deal) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](loan, errorList, deal);
  }

  return errorList;
};
