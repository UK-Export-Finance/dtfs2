const {
  isNumeric,
  roundNumber,
  formattedNumber,
} = require('../../utils/number');
const { hasValue } = require('../../utils/string');

const calculateTotalValue = (supplyContractConversionRateToGbp, bonds, loans) => {
  let bondCurrency = 0;
  let loanCurrency = 0;

  if (bonds.length > 0) {
    bonds.forEach((bond) => {
      bondCurrency += (Number(bond.facilityValue) / Number(bond.conversionRate));
    });
  }

  if (loans.length > 0) {
    loans.forEach((loan) => {
      loanCurrency += (Number(loan.facilityValue) / Number(loan.conversionRate));
    });
  }

  const dealCurrency = bondCurrency + loanCurrency;
  const bondInGbp = (bondCurrency / supplyContractConversionRateToGbp);
  const loanInGbp = (loanCurrency / supplyContractConversionRateToGbp);
  const dealInGbp = (bondInGbp + loanInGbp);

  return {
    dealCurrency: formattedNumber(roundNumber(dealCurrency, 2)),
    dealInGbp: formattedNumber(roundNumber(dealInGbp, 2)),
    bondCurrency: formattedNumber(roundNumber(bondCurrency, 2)),
    bondInGbp: formattedNumber(roundNumber(bondInGbp, 2)),
    loanCurrency: formattedNumber(roundNumber(loanCurrency, 2)),
    loanInGbp: formattedNumber(roundNumber(loanInGbp, 2)),
  };
};

const calculateDealSummary = (deal) => {
  const { supplyContractConversionRateToGBP } = deal.submissionDetails;
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const completedBonds = bonds.filter((b) => b.status === 'Completed');
  const completedLoans = loans.filter((l) => l.status === 'Completed');
  const hasCompletedBonds = completedBonds.length > 0;
  const hasCompletedLoans = completedLoans.length > 0;

  const hasSupplyContractConversionRateToGBP = (hasValue(supplyContractConversionRateToGBP)
                                               && isNumeric(Number(supplyContractConversionRateToGBP)));

  const canCalculate = (hasSupplyContractConversionRateToGBP && (hasCompletedBonds || hasCompletedLoans));

  if (canCalculate) {
    return {
      totalValue: calculateTotalValue(
        Number(supplyContractConversionRateToGBP),
        completedBonds,
        completedLoans,
      ),
      // totalUkefExposure: calculateTotalUkefExposure,
    };
  }
  return {};
};

module.exports = calculateDealSummary;
