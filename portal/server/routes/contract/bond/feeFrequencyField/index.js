const feeFrequencyField = (bondBody, existingBond) => {
  const modifiedBond = bondBody;

  const { feeType, feeFrequency, inAdvanceFeeFrequency, inArrearFeeFrequency } = modifiedBond;

  const feeFrequencyValue = () => {
    if (feeType === 'In advance') {
      return inAdvanceFeeFrequency;
    }

    if (feeType === 'In arrear') {
      return inArrearFeeFrequency;
    }

    if (feeFrequency) {
      return feeFrequency;
    }

    if (existingBond && existingBond.feeFrequency) {
      return existingBond.feeFrequency;
    }

    return '';
  };

  modifiedBond.feeFrequency = feeFrequencyValue();

  delete modifiedBond.inAdvanceFeeFrequency;
  delete modifiedBond.inArrearFeeFrequency;

  return modifiedBond;
};

module.exports = feeFrequencyField;
