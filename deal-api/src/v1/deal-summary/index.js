const {
  isNumeric,
  roundNumber,
} = require('../../utils/number');

const calculateDealSummary = (deal) => {
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  const hasBondsOrLoans = (hasBonds || hasLoans);

  // can only do this calculation if the deal:
  // has supplyContractConversionRateToGBP
  // has at least one bond or loan completed

  const { supplyContractConversionRateToGBP } = deal.submissionDetails;

  if (isNumeric(supplyContractConversionRateToGBP) && hasBondsOrLoans) {
    const supplyContractConversionRateToGbp = Number(supplyContractConversionRateToGBP);

    const completedBonds = bonds.filter((b) => b.status === 'Completed');
    const completedLoans = loans.filter((l) => l.status === 'Completed');

    if (completedBonds.length < 1 && completedLoans.length < 1) {
      return null;
    }

    let bondCurrency = 0;
    let loanCurrency = 0;

    if (completedBonds.length > 0) {
      completedBonds.forEach((bond) => {
        bondCurrency += (Number(bond.facilityValue) / Number(bond.conversionRate));
      });
    }

    if (completedLoans.length > 0) {
      completedLoans.forEach((loan) => {
        loanCurrency += (Number(loan.facilityValue) / Number(loan.conversionRate));
      });
    }

    const dealCurrency = bondCurrency + loanCurrency;
    const bondInGbp = (bondCurrency / supplyContractConversionRateToGbp);

    const loanInGbp = (loanCurrency / supplyContractConversionRateToGbp);
    const dealInGbp = (bondInGbp + loanInGbp);

    const formattedNumber = (numb) => roundNumber(numb, 2).toLocaleString('en', { minimumFractionDigits: 2 });

    return {
      totalValue: {
        dealCurrency: formattedNumber(dealCurrency),
        dealInGbp: formattedNumber(dealInGbp),
        bondCurrency: formattedNumber(bondCurrency),
        bondInGbp: formattedNumber(bondInGbp),
        loanCurrency: formattedNumber(loanCurrency),
        loanInGbp: formattedNumber(loanInGbp),
      },
      // TODO
      // ukefExposure: {},
    };
  }
  return {};
};

module.exports = calculateDealSummary;
