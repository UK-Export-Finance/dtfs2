import canIssueFacility from './canIssueFacility';

const dealWithCanIssueFacilityFlags = (userRoles, deal) => {
  const modifiedDeal = deal;

  const bonds = modifiedDeal.bondTransactions.items;
  const loans = modifiedDeal.loanTransactions.items;

  bonds.map((b) => {
    const bond = b;
    if (canIssueFacility(userRoles, deal, b)) {
      bond.canIssueOrEditIssueFacility = true;
    }

    return bond;
  });

  loans.map((l) => {
    const loan = l;
    if (canIssueFacility(userRoles, deal, l)) {
      loan.canIssueOrEditIssueFacility = true;
    }

    return loan;
  });

  return modifiedDeal;
};

export default dealWithCanIssueFacilityFlags;
