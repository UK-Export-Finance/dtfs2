const bondValidationErrors = require('../validation/bond');

const bondStatus = (bond, bondErrors) => {
  if (!bondErrors || bondErrors.count === 0) {
    // this will be 'Ready for checker', 'Submitted', or 'Acknowledged by UKEF'
    // this comes from either:
    // the deal status changing - when submitting a deal with an issued bond, we add a status to the bond.
    // otherwise the status originally came from workflow/xml.
    if (bond.status) {
      return bond.status;
    }

    // with no status - the deal has not been submitted/issued, and there are no validationErrors in the bond.
    return 'Completed';
  }

  // we have no status and the bond has validation errors, therefore Incomplete.
  return 'Incomplete';
};

const addAccurateStatusesToBonds = (bondTransactions) => {
  if (bondTransactions.items.length) {
    bondTransactions.items.forEach((b) => {
      const bond = b;
      const validationErrors = bondValidationErrors(bond);
      bond.status = bondStatus(bond, validationErrors);
    });
  }
  return bondTransactions;
};

module.exports = {
  bondStatus,
  addAccurateStatusesToBonds,
};
