const canIssueOrEditIssueFacility = require('./canIssueOrEditIssueFacility');

const dealWithCanIssueFacilityFlags = (userRoles, deal) => {
  const modifiedDeal = deal;

  const bonds = modifiedDeal.bondTransactions.items;
  const loans = modifiedDeal.loanTransactions.items;

  bonds.map((bond) => {
    const mappedBond = bond;

    if (canIssueOrEditIssueFacility(userRoles, deal, bond)) {
      mappedBond.canIssueOrEditIssueFacility = true;
    }

    return mappedBond;
  });

  loans.map((loan) => {
    const mappedLoan = loan;

    if (canIssueOrEditIssueFacility(userRoles, deal, loan)) {
      mappedLoan.canIssueOrEditIssueFacility = true;
    }

    return mappedLoan;
  });

  return modifiedDeal;
};

module.exports = dealWithCanIssueFacilityFlags;
