// TODO: rename as they have not actually been issued yet, just the details added.
const dealHasIssuedFacilities = (deal) => {
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const bondsWithIssuedFacilities = bonds.filter((bond) => bond.issueFacilityDetailsProvided === true);
  const loansWithIssuedFacilities = loans.filter((loan) => loan.issueFacilityDetailsProvided === true);

  const hasIssuedFacilities = (bondsWithIssuedFacilities.length > 0 || loansWithIssuedFacilities.length > 0);
  if (hasIssuedFacilities) {
    return true;
  }

  return false;
};

export default dealHasIssuedFacilities;
