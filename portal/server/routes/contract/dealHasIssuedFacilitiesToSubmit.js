const dealHasIssuedFacilitiesToSubmit = (deal) => {
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const unsubmittedLoansWithIssuedFacilities = loans.filter((loan) =>
    (loan.issueFacilityDetailsProvided === true
    && !loan.issueFacilityDetailsSubmitted
    && loan.status !== 'Ready for Checker\'s approval'
    && loan.status !== 'Submitted'));

  const unsubmittedBondsWithIssuedFacilities = bonds.filter((bond) =>
    (bond.issueFacilityDetailsProvided === true
    && !bond.issueFacilityDetailsSubmitted
    && bond.status !== 'Ready for Checker\'s approval'
    && bond.status !== 'Submitted'));

  const hasIssuedFacilities = (unsubmittedBondsWithIssuedFacilities.length > 0
                              || unsubmittedLoansWithIssuedFacilities.length > 0);

  if (hasIssuedFacilities) {
    return true;
  }

  return false;
};

export default dealHasIssuedFacilitiesToSubmit;
