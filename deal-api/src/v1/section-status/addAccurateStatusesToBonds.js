// TODO: be DRY, this is very similar to section-status.

const bondStatus = (bond, bondErrors) => {
  if (!bondErrors || bondErrors.count === 0) {
    if (bond.issueFacilityDetailsProvided) {
      // this will either be 'Ready for checker' or 'Submitted'
      return bond.status;
    }
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
