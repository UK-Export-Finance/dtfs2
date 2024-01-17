const premiumFrequencyField = (loanBody, existingLoan) => {
  const modifiedLoan = loanBody;

  const { premiumType, premiumFrequency, inAdvancePremiumFrequency, inArrearPremiumFrequency } = modifiedLoan;

  const premiumFrequencyValue = () => {
    if (premiumType === 'In advance') {
      return inAdvancePremiumFrequency;
    }

    if (premiumType === 'In arrear') {
      return inArrearPremiumFrequency;
    }

    if (premiumFrequency) {
      return premiumFrequency;
    }

    if (existingLoan && existingLoan.premiumFrequency) {
      return existingLoan.premiumFrequency;
    }

    return '';
  };

  modifiedLoan.premiumFrequency = premiumFrequencyValue();

  delete modifiedLoan.inAdvancePremiumFrequency;
  delete modifiedLoan.inArrearPremiumFrequency;

  return modifiedLoan;
};

module.exports = premiumFrequencyField;
