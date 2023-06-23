const canAmendFacility = require('./canAmendFacility');
const canIssueOrEditIssueFacility = require('./canIssueOrEditIssueFacility');

const dealWithFacilityFlags = (userRoles, deal) => {
  const modifiedDeal = deal;

  const bonds = modifiedDeal.bondTransactions.items;
  const loans = modifiedDeal.loanTransactions.items;

  bonds.map((b) => {
    const bond = b;

    if (canIssueOrEditIssueFacility(userRoles, deal, b)) {
      bond.canIssueOrEditIssueFacility = true;
    }

    bond.canAmendFacility = canAmendFacility(userRoles, deal, b);

    return bond;
  });

  loans.map((l) => {
    const loan = l;

    if (canIssueOrEditIssueFacility(userRoles, deal, l)) {
      loan.canIssueOrEditIssueFacility = true;
    }

    loan.canAmendFacility = canAmendFacility(userRoles, deal, l);

    return loan;
  });

  return modifiedDeal;
};

module.exports = dealWithFacilityFlags;
