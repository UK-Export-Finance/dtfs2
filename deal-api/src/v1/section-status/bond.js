const bondValidationErrors = require('../validation/bond');

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
      const validationErrors = bondValidationErrors(bond);
      bond.status = bondStatus(validationErrors);
    });
  }
  return bondTransactions;
};

module.exports = {
  bondStatus,
  multipleBondStatus,
};
