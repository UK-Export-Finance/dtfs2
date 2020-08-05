const dealHasIssuedFacilitiesToSubmit = (deal) => {
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const unsubmittedBondsWithIssuedFacilities = bonds.filter((bond) =>
    (bond.issueFacilityDetailsProvided === true && !bond.issueFacilityDetailsSubmitted));

  const unsubmittedLoansWithIssuedFacilities = loans.filter((loan) =>
    (loan.issueFacilityDetailsProvided === true && !loan.issueFacilityDetailsSubmitted));

  const hasIssuedFacilities = (unsubmittedBondsWithIssuedFacilities.length > 0
                              || unsubmittedLoansWithIssuedFacilities.length > 0);

  if (hasIssuedFacilities) {
    return true;
  }

  return false;
};

export default dealHasIssuedFacilitiesToSubmit;
