const { roundNumber } = require('../../utils/number');

const calculateDealSummary = (deal) => {
  // TODO: should the summary only be generated when XYZ completed?

  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  const hasBondsOrLoans = (hasBonds || hasLoans);

  if (hasBondsOrLoans) {
    const { supplyContractConversionRateToGBP } = deal.submissionDetails;
    const supplyContractConversionRateToGbp = Number(supplyContractConversionRateToGBP);

    let bondCurrency = 0;
    let loanCurrency = 0;

    if (hasBonds) {
      bonds.forEach((bond) => {
        bondCurrency += (Number(bond.facilityValue) / Number(bond.conversionRate));
      });
    }

    if (hasLoans) {
      loans.forEach((loan) => {
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
