export const allBondsCompleted = (bonds) => {
  const incompleteBonds = bonds.filter((b) => b.status !== 'Completed');
  if (incompleteBonds.length > 0) {
    return false;
  }
  return true;
};

const dealFormsCompleted = (deal) => {
  const {
    eligibility,
    bondTransactions,
  } = deal;

  // TODO when submissionDetails/loans have status handling
  // if (submissionDetails === 'Completed'
  //     && eligibility.status === 'Completed'
  //     && allBondsCompleted(bondTransactions.items)
  //     && allLoansCompleted(loanTransactions.items)) {
  //   return true;
  // }

  if (eligibility.status === 'Completed'
    && allBondsCompleted(bondTransactions.items)) {
    return true;
  }

  return false;
};

export default dealFormsCompleted;
