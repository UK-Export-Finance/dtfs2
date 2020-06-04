const { getBondErrors } = require('../validation/bond');

const bondStatus = (bondErrors) => {
  if (bondErrors.count === 0) {
    return 'Completed';
  }
  return 'Incomplete';
};

const multipleBondStatus = (bondTransactions) => {
  if (bondTransactions.items.length) {
    bondTransactions.items.forEach((b) => {
      const bond = b;
      const bondValidationErrors = getBondErrors(bond);
      bond.status = bondStatus(bondValidationErrors);
    });
  }
  return bondTransactions;
};

module.exports = {
  bondStatus,
  multipleBondStatus,
};
