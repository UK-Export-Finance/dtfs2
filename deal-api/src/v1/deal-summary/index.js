const {
  isNumeric,
  roundNumber,
  formattedNumber,
} = require('../../utils/number');
const { hasValue } = require('../../utils/string');

const calculateTotalValue = (supplyContractConversionRateToGbp, bonds, loans) => {
  let bondInDealCurrency = 0;
  let bondsHaveAConversionRateToGbp = false;
  let loanInDealCurrency = 0;
  let loansHaveAConversionRateToGbp = false;

  if (bonds.length > 0) {
    bonds.forEach((bond) => {
      const { facilityValue, conversionRate, currency } = bond;
      bondInDealCurrency += (Number(facilityValue) / Number(conversionRate));

      if (currency && currency.id === 'GBP') {
        bondsHaveAConversionRateToGbp = true;
      }
    });
  }

  if (loans.length > 0) {
    loans.forEach((loan) => {
      const { facilityValue, conversionRate, currency } = loan;
      loanInDealCurrency += (Number(facilityValue) / Number(conversionRate));

      if (currency && currency.id === 'GBP') {
        loansHaveAConversionRateToGbp = true;
      }
    });
  }

  const dealInDealCurrency = bondInDealCurrency + loanInDealCurrency;

  const bondInGbp = () => {
    if (bondsHaveAConversionRateToGbp) {
      return bondInDealCurrency;
    }
    return (bondInDealCurrency / supplyContractConversionRateToGbp);
  };

  const loanInGbp = () => {
    if (loansHaveAConversionRateToGbp) {
      return loanInDealCurrency;
    }
    return (loanInDealCurrency / supplyContractConversionRateToGbp);
  };

  const dealInGbp = (bondInGbp() + loanInGbp());

  return {
    dealInDealCurrency: formattedNumber(roundNumber(dealInDealCurrency, 2)),
    dealInGbp: formattedNumber(roundNumber(dealInGbp, 2)),
    bondInDealCurrency: formattedNumber(roundNumber(bondInDealCurrency, 2)),
    bondInGbp: formattedNumber(roundNumber(bondInGbp(), 2)),
    loanInDealCurrency: formattedNumber(roundNumber(loanInDealCurrency, 2)),
    loanInGbp: formattedNumber(roundNumber(loanInGbp(), 2)),
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
    };
  }
  return {};
};

module.exports = calculateDealSummary;
