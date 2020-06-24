// TODO: be DRY, this is very similar to section-status.

const bondStatus = (bondErrors) => {
  if (!bondErrors || bondErrors.count === 0) {
    return 'Completed';
  }
  return 'Incomplete';
};

module.exports = (bondTransactions, validationErrors) => {
  if (bondTransactions && bondTransactions.items && bondTransactions.items.length && validationErrors) {
    bondTransactions.items.forEach((b) => {
      const bond = b;
      const errorsForThisBond = validationErrors[bond._id].errorList; // eslint-disable-line no-underscore-dangle
      bond.status = bondStatus(errorsForThisBond);
    });
  }

  return bondTransactions;
};
