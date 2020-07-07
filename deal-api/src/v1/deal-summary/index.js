const {
  isNumeric,
  roundNumber,
  formattedNumber,
  sanitizeCurrency,
} = require('../../utils/number');
const { hasValue } = require('../../utils/string');

const calculateBondInGbp = (bondInDealCurrency, supplyContractConversionRateToGbp) => {
  if (Number(supplyContractConversionRateToGbp) > 0) {
    return (bondInDealCurrency / supplyContractConversionRateToGbp);
  }
  return bondInDealCurrency;
};

const calculateLoanInGbp = (loanInDealCurrency, supplyContractConversionRateToGbp) => {
  if (Number(supplyContractConversionRateToGbp) > 0) {
    return (loanInDealCurrency / supplyContractConversionRateToGbp);
  }
  return loanInDealCurrency;
};

// TODO: not sure about these params being passed around
const calculateDealInGbp = (
  hasBonds,
  hasLoans,
  bondInDealCurrency,
  loanInDealCurrency,
  supplyContractConversionRateToGbp,
) => {
  let result = 0;

  if (hasBonds) {
    result = calculateBondInGbp(bondInDealCurrency, supplyContractConversionRateToGbp);
  }

  if (hasLoans) {
    result += calculateLoanInGbp(loanInDealCurrency, supplyContractConversionRateToGbp);
  }

  return result;
};

const calculateFacilitiesTotalInDealCurrency = (facilities) => {
  const totalUkefExposure = {
    inDealCurrency: 0,
  };
  const totalValue = {
    inDealCurrency: 0,
  };

  if (facilities.length > 0) {
    facilities.forEach((facility) => {
      const {
        facilityValue,
        conversionRate,
        ukefExposure,
      } = facility;

      // TODO: ukefExposure should be sanitising when added to DB.
      const sanitizedUkefExposure = sanitizeCurrency(ukefExposure).sanitizedValue;

      if (hasValue(conversionRate)) {
        totalValue.inDealCurrency += (Number(facilityValue) / Number(conversionRate));
        totalUkefExposure.inDealCurrency += (Number(sanitizedUkefExposure) / Number(conversionRate));
      } else {
        totalValue.inDealCurrency += Number(facilityValue);
        totalUkefExposure.inDealCurrency += Number(sanitizedUkefExposure);
      }
    });
  }

  return {
    totalValue,
    totalUkefExposure,
  };
};

const calculateTotalValues = (
  bondsInDealCurrency,
  loansInDealCurrency,
  supplyContractConversionRateToGbp,
  bonds,
  loans,
) => {
  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  // TODO: bondS<<
  // TODO: loanS<<

  const dealInDealCurrency = bondsInDealCurrency + loansInDealCurrency;

  const dealInGbp = calculateDealInGbp(
    hasBonds,
    hasLoans,
    bondsInDealCurrency,
    loansInDealCurrency,
    supplyContractConversionRateToGbp,
  );

  const bondInGbp = calculateBondInGbp(bondsInDealCurrency, supplyContractConversionRateToGbp);
  const loanInGbp = calculateLoanInGbp(loansInDealCurrency, supplyContractConversionRateToGbp);

  return {
    dealInDealCurrency: formattedNumber(roundNumber(dealInDealCurrency, 2)),
    dealInGbp: formattedNumber(roundNumber(dealInGbp, 2)),
    bondInDealCurrency: formattedNumber(roundNumber(bondsInDealCurrency, 2)),
    bondInGbp: formattedNumber(roundNumber(bondInGbp, 2)),
    loanInDealCurrency: formattedNumber(roundNumber(loansInDealCurrency, 2)),
    loanInGbp: formattedNumber(roundNumber(loanInGbp, 2)),
  };
};

const calculateTotalUkefExposure = (
  bondsInDealCurrency,
  loansInDealCurrency,
  supplyContractConversionRateToGbp,
  bonds,
  loans,
) => {
  const hasBonds = bonds.length > 0;
  const hasLoans = loans.length > 0;

  // TODO: bondS<<
  // TODO: loanS<<

  const dealInDealCurrency = bondsInDealCurrency + loansInDealCurrency;

  const dealInGbp = calculateDealInGbp(
    hasBonds,
    hasLoans,
    bondsInDealCurrency,
    loansInDealCurrency,
    supplyContractConversionRateToGbp,
  );

  const bondInGbp = calculateBondInGbp(bondsInDealCurrency, supplyContractConversionRateToGbp);
  const loanInGbp = calculateLoanInGbp(loansInDealCurrency, supplyContractConversionRateToGbp);

  return {
    dealInDealCurrency: formattedNumber(roundNumber(dealInDealCurrency, 2)),
    dealInGbp: formattedNumber(roundNumber(dealInGbp, 2)),
    bondInDealCurrency: formattedNumber(roundNumber(bondsInDealCurrency, 2)),
    bondInGbp: formattedNumber(roundNumber(bondInGbp, 2)),
    loanInDealCurrency: formattedNumber(roundNumber(loansInDealCurrency, 2)),
    loanInGbp: formattedNumber(roundNumber(loanInGbp, 2)),
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
    const {
      totalValue: bondsTotalValue,
      totalUkefExposure: bondsTotalUkefExposure,
    } = calculateFacilitiesTotalInDealCurrency(bonds);

    const {
      totalValue: loansTotalValue,
      totalUkefExposure: loansTotalUkefExposure,
    } = calculateFacilitiesTotalInDealCurrency(loans);

    return {
      totalValue: calculateTotalValues(
        bondsTotalValue.inDealCurrency,
        loansTotalValue.inDealCurrency,
        Number(supplyContractConversionRateToGBP),
        completedBonds,
        completedLoans,
      ),
      totalUkefExposure: calculateTotalUkefExposure(
        bondsTotalUkefExposure.inDealCurrency,
        loansTotalUkefExposure.inDealCurrency,
        Number(supplyContractConversionRateToGBP),
        completedBonds,
        completedLoans,
      ),
    };
  }
  return {};
};

module.exports = calculateDealSummary;
