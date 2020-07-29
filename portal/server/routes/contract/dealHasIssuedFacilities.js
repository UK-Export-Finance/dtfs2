const dealHasIssuedFacilities = (deal) => {
  const bonds = deal.bondTransactions.items;
  const loans = deal.loanTransactions.items;

  const bondsWithIssuedFacilities = bonds.filter((bond) => bond.facilityIssued === true);
  const loansWithIssuedFacilities = loans.filter((loan) => loan.facilityIssued === true);

  const hasIssuedFacilities = (bondsWithIssuedFacilities.length > 0 || loansWithIssuedFacilities.length > 0);
  if (hasIssuedFacilities) {
    return true;
  }

  return false;
};

export default dealHasIssuedFacilities;
