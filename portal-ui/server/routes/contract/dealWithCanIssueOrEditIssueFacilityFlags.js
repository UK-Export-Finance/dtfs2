const canIssueOrEditIssueFacility = require('./canIssueOrEditIssueFacility');

const dealWithCanIssueFacilityFlags = (userRoles, deal) => {
  const modifiedDeal = deal;

  const bonds = modifiedDeal.bondTransactions.items;
  const loans = modifiedDeal.loanTransactions.items;

  bonds.map((b) => {
    const bond = b;
    if (canIssueOrEditIssueFacility(userRoles, deal, b)) {
      bond.canIssueOrEditIssueFacility = true;
    }

    return bond;
  });

  loans.map((l) => {
    const loan = l;
    if (canIssueOrEditIssueFacility(userRoles, deal, l)) {
      loan.canIssueOrEditIssueFacility = true;
    }

    return loan;
  });

  return modifiedDeal;
};

module.exports = dealWithCanIssueFacilityFlags;
