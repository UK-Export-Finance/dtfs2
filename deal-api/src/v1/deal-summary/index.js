const {
  isNumeric,
  roundNumber,
  formattedNumber,
  sanitizeCurrency,
} = require('../../utils/number');
const { hasValue } = require('../../utils/string');

const calculateTotalValues = (supplyContractConversionRateToGbp, bonds, loans) => {
  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  // TODO: bondS<<
  // TODO: loanS<<
  let bondInDealCurrency = 0;
  let loanInDealCurrency = 0;

  if (hasBonds) {
    bonds.forEach((bond) => {
      const { facilityValue, conversionRate } = bond;

      if (hasValue(conversionRate)) {
        bondInDealCurrency += (Number(facilityValue) / Number(conversionRate));
      } else {
        bondInDealCurrency += Number(facilityValue);
      }
    });
  }

  if (hasLoans) {
    loans.forEach((loan) => {
      const { facilityValue, conversionRate } = loan;

      if (hasValue(conversionRate)) {
        loanInDealCurrency += (Number(facilityValue) / Number(conversionRate));
      } else {
        loanInDealCurrency += Number(facilityValue);
      }
    });
  }

  const dealInDealCurrency = bondInDealCurrency + loanInDealCurrency;

  const bondInGbp = () => {
    if (Number(supplyContractConversionRateToGbp) > 0) {
      return (bondInDealCurrency / supplyContractConversionRateToGbp);
    }
    return bondInDealCurrency;
  };

  const loanInGbp = () => {
    if (Number(supplyContractConversionRateToGbp) > 0) {
      return (loanInDealCurrency / supplyContractConversionRateToGbp);
    }
    return loanInDealCurrency;
  };

  const dealInGbp = () => {
    let result = 0;

    if (hasBonds) {
      result = bondInGbp();
    }

    if (hasLoans) {
      result += loanInGbp();
    }

    return result;
  };

  return {
    dealInDealCurrency: formattedNumber(roundNumber(dealInDealCurrency, 2)),
    dealInGbp: formattedNumber(roundNumber(dealInGbp(), 2)),
    bondInDealCurrency: formattedNumber(roundNumber(bondInDealCurrency, 2)),
    bondInGbp: formattedNumber(roundNumber(bondInGbp(), 2)),
    loanInDealCurrency: formattedNumber(roundNumber(loanInDealCurrency, 2)),
    loanInGbp: formattedNumber(roundNumber(loanInGbp(), 2)),
  };
};


const calculateTotalUkefExposure = (supplyContractConversionRateToGbp, bonds, loans) => {
  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  // TODO: bondS<<
  // TODO: loanS<<
  let bondInDealCurrency = 0;
  let loanInDealCurrency = 0;

  if (hasBonds) {
    bonds.forEach((bond) => {
      const { ukefExposure, conversionRate } = bond;

      // TODO: ukefExposure should be sanitising when added to DB.
      const sanitizedUkefExposure = sanitizeCurrency(ukefExposure).sanitizedValue;

      if (hasValue(conversionRate)) {
        bondInDealCurrency += (Number(sanitizedUkefExposure) / Number(conversionRate));
      } else {
        bondInDealCurrency += Number(sanitizedUkefExposure);
      }
    });
  }

  if (hasLoans) {
    loans.forEach((loan) => {
      const { ukefExposure, conversionRate } = loan;

      // TODO: ukefExposure should be sanitising when added to DB.
      const sanitizedUkefExposure = sanitizeCurrency(ukefExposure).sanitizedValue;

      if (hasValue(conversionRate)) {
        loanInDealCurrency += (Number(sanitizedUkefExposure) / Number(conversionRate));
      } else {
        loanInDealCurrency += Number(sanitizedUkefExposure);
      }
    });
  }

  const dealInDealCurrency = bondInDealCurrency + loanInDealCurrency;

  const bondInGbp = () => {
    if (Number(supplyContractConversionRateToGbp) > 0) {
      return (bondInDealCurrency / supplyContractConversionRateToGbp);
    }
    return bondInDealCurrency;
  };

  const loanInGbp = () => {
    if (Number(supplyContractConversionRateToGbp) > 0) {
      return (loanInDealCurrency / supplyContractConversionRateToGbp);
    }
    return loanInDealCurrency;
  };

  const dealInGbp = () => {
    let result = 0;

    if (hasBonds) {
      result = bondInGbp();
    }

    if (hasLoans) {
      result += loanInGbp();
    }

    return result;
  };

  return {
    dealInDealCurrency: formattedNumber(roundNumber(dealInDealCurrency, 2)),
    dealInGbp: formattedNumber(roundNumber(dealInGbp(), 2)),
    bondInDealCurrency: formattedNumber(roundNumber(bondInDealCurrency, 2)),
    bondInGbp: formattedNumber(roundNumber(bondInGbp(), 2)),
    loanInDealCurrency: formattedNumber(roundNumber(loanInDealCurrency, 2)),
    loanInGbp: formattedNumber(roundNumber(loanInGbp(), 2)),
  };
};


const calculateDealSummary = (deal) => {
  const {
    supplyContractCurrency,
    supplyContractConversionRateToGBP,
  } = deal.submissionDetails;
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const completedBonds = bonds.filter((b) => b.status === 'Completed');
  const completedLoans = loans.filter((l) => l.status === 'Completed');
  const hasCompletedBonds = completedBonds.length > 0;
  const hasCompletedLoans = completedLoans.length > 0;

  const hasSupplyContractCurrencyId = (supplyContractCurrency
                                      && supplyContractCurrency.id
                                      && hasValue(supplyContractCurrency.id));

  const hasSupplyContractConversionRateToGBP = (hasValue(supplyContractConversionRateToGBP)
                                               && isNumeric(Number(supplyContractConversionRateToGBP)));

  const hasRelevantSupplyContractValues = (hasSupplyContractCurrencyId && supplyContractCurrency.id === 'GBP')
                                          || (hasSupplyContractCurrencyId && hasSupplyContractConversionRateToGBP);

  const canCalculate = (hasRelevantSupplyContractValues && (hasCompletedBonds || hasCompletedLoans));

  if (canCalculate) {
    return {
      totalValue: calculateTotalValues(
        Number(supplyContractConversionRateToGBP),
        completedBonds,
        completedLoans,
      ),
      totalUkefExposure: calculateTotalUkefExposure(
        Number(supplyContractConversionRateToGBP),
        completedBonds,
        completedLoans,
      ),
    };
  }
  return {};
};

module.exports = calculateDealSummary;
